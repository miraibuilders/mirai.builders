import { resolve4, resolve6, resolveMx, resolveTxt } from "node:dns/promises";
import tls from "node:tls";
import {
  allowedHeaders,
  cookieNamesFrom,
  metaGeneratorValues,
  sanitizeDetailResult,
  sanitizeScanResult,
} from "./allowlist.js";
import type { DetailPage, DetailScanResult, FetchedPage, ScanResult, ScanSources } from "./types.js";

const TIMEOUT_MS = 5000;

export const EXPOSED_PATHS = ["/.git/config", "/.env", "/backup.zip", "/backup.sql", "/backup.tar.gz"];

export const DETAIL_PATHS = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  ...EXPOSED_PATHS,
  "/favicon.ico",
  "/humans.txt",
];

function emptyTls(): ScanResult["tls"] {
  return {
    valid: false,
    daysLeft: null,
    issuer: null,
    protocol: null,
    sans: [],
    expiring: false,
  };
}

function headersToObject(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}

async function fetchPage(url: string): Promise<FetchedPage> {
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return {
    status: response.status,
    headers: headersToObject(response.headers),
    body: await response.text(),
  };
}

async function probePath(url: string, path: string): Promise<number> {
  const target = new URL(path, url);
  const response = await fetch(target, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return response.status;
}

function readTls(url: string): Promise<ScanResult["tls"]> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") return Promise.resolve(emptyTls());

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: ScanResult["tls"]) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const socket = tls.connect(
      {
        host: parsed.hostname,
        port: Number(parsed.port || 443),
        servername: parsed.hostname,
        rejectUnauthorized: false,
      },
      () => {
        const certificate = socket.getPeerCertificate();
        const daysLeft = certificate.valid_to
          ? Math.floor((new Date(certificate.valid_to).getTime() - Date.now()) / 86400000)
          : null;
        const issuer = certificate.issuer?.O ?? certificate.issuer?.CN ?? null;
        finish({
          valid: socket.authorized,
          daysLeft,
          issuer: Array.isArray(issuer) ? issuer[0] ?? null : issuer,
          protocol: socket.getProtocol(),
          sans: Array.isArray(certificate.subjectaltname)
            ? certificate.subjectaltname
            : String(certificate.subjectaltname ?? "")
                .split(",")
                .map((entry) => entry.trim().replace(/^DNS:/, ""))
                .filter(Boolean),
          expiring: daysLeft !== null && daysLeft <= 30,
        });
        socket.end();
      },
    );
    socket.setTimeout(TIMEOUT_MS, () => {
      socket.destroy();
      finish(emptyTls());
    });
    socket.on("error", () => finish(emptyTls()));
  });
}

function flattenTxt(records: string[][]): string[] {
  return records.flat().map((record) => record.toLowerCase());
}

async function readDns(url: string): Promise<ScanResult["dns"]> {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const [aRecords, aaaaRecords, mxRecords, txtRecords, dmarcRecords] = await Promise.allSettled([
    resolve4(host),
    resolve6(host),
    resolveMx(host),
    resolveTxt(host),
    resolveTxt(`_dmarc.${host}`),
  ]);

  const txt = txtRecords.status === "fulfilled" ? flattenTxt(txtRecords.value) : [];
  const selectors = new Set<string>();
  for (const record of txt) {
    for (const match of record.matchAll(/dkim(?:selector)?=([a-z0-9_-]+)/g)) {
      selectors.add(match[1]);
    }
  }

  const dkimChecks = await Promise.allSettled(
    [...selectors].slice(0, 3).map(async (selector) => {
      const records = await resolveTxt(`${selector}._domainkey.${host}`);
      return flattenTxt(records).some((record) => record.includes("v=dkim1"));
    }),
  );

  return {
    a: aRecords.status === "fulfilled",
    aaaa: aaaaRecords.status === "fulfilled",
    mx: mxRecords.status === "fulfilled",
    spf: txt.some((record) => record.startsWith("v=spf1")),
    dmarc:
      dmarcRecords.status === "fulfilled" &&
      flattenTxt(dmarcRecords.value).some((record) => record.startsWith("v=dmarc1")),
    dkimSelectors: dkimChecks
      .map((check, index) => (check.status === "fulfilled" && check.value ? [...selectors][index] : null))
      .filter((value): value is string => Boolean(value)),
  };
}

export const defaultScanSources: ScanSources = {
  fetchPage,
  probePath,
  readTls,
  readDns,
};

export async function scanWebsite(url: string, sources: ScanSources = defaultScanSources): Promise<ScanResult> {
  const page = await sources.fetchPage(url);
  const headers = page.headers;
  const generators = metaGeneratorValues(page.body);
  const [tlsInfo, dnsInfo] = await Promise.all([sources.readTls(url), sources.readDns(url)]);

  const exposed: string[] = [];
  for (const path of EXPOSED_PATHS) {
    try {
      if (await sources.probePath(url, path) === 200) exposed.push(path);
    } catch {
      exposed.push(path);
    }
  }

  const result: ScanResult = {
    scannedAt: new Date().toISOString(),
    url,
    http: {
      status: page.status,
      headers: {
        ...Object.fromEntries(
          Object.entries(headers).filter(([name]) =>
            ["server", "x-powered-by", "via", "cf-ray", "set-cookie"].includes(name.toLowerCase()),
          ),
        ),
      },
    },
    technologies: {
      server: headers.server ?? headers.Server ?? null,
      poweredBy: headers["x-powered-by"] ?? headers["X-Powered-By"] ?? null,
      via: headers.via ?? headers.Via ?? null,
      cfRay: Boolean(headers["cf-ray"] ?? headers["CF-Ray"]),
      generators,
      phpVersion: null,
      phpEol: false,
      cms: null,
    },
    tls: tlsInfo,
    dns: dnsInfo,
    exposed,
    cookieNames: cookieNamesFrom(headers["set-cookie"] ?? headers["Set-Cookie"]),
  };

  return sanitizeScanResult(result);
}

export async function scanWebsiteDetailed(
  url: string,
  sources: ScanSources = defaultScanSources,
): Promise<DetailScanResult> {
  const base = await scanWebsite(url, sources);
  const pages: DetailPage[] = [];

  for (const path of DETAIL_PATHS) {
    const target = new URL(path, url).toString();
    try {
      const page = await sources.fetchPage(target);
      pages.push({
        path: target,
        status: page.status,
        headers: allowedHeaders(page.headers),
        generators: metaGeneratorValues(page.body),
      });
    } catch {
      pages.push({ path: target, status: 0, headers: {}, generators: [] });
    }
  }

  return sanitizeDetailResult({ ...base, pages });
}
