import type {
  DetailPage,
  DetailScanResult,
  ScanResult,
  ScoreResult,
  StoredDetailScanResult,
  StoredScanResult,
} from "./types";

export const ALLOWED_HEADER_NAMES = [
  "server",
  "x-powered-by",
  "via",
  "cf-ray",
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
] as const;

export const ALLOWED_PAIN_FLAGS = [
  "eol_php",
  "outdated_cms",
  "missing_dmarc",
  "expiring_tls",
  "exposed_secrets",
] as const;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/g;

export function safeShortText(value: string | null | undefined, limit = 160): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(EMAIL_PATTERN, "[REDACTED]")
    .replace(PHONE_PATTERN, "[REDACTED]")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, limit);
  return cleaned.length > 0 ? cleaned : null;
}

export function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "[INVALID_URL]";
  }
}

export function allowedHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of ALLOWED_HEADER_NAMES) {
    const value = safeShortText(headers[name] ?? headers[name.toLowerCase()] ?? null);
    if (value) result[name] = value;
  }
  return result;
}

export function cookieNamesFrom(header: string | null | undefined): string[] {
  if (!header) return [];
  const names = new Set<string>();
  const parts = header.split(/,(?=\s*[^;,=]+=)/);
  for (const part of parts) {
    const name = part.trim().split("=", 1)[0]?.trim() ?? "";
    if (/^[A-Za-z0-9_-]{1,64}$/.test(name)) names.add(name);
  }
  return [...names].sort();
}

export function metaGeneratorValues(html: string): string[] {
  const headEnd = html.toLowerCase().indexOf("</head>");
  const head = headEnd >= 0 ? html.slice(0, headEnd + 7) : html.slice(0, 16384);
  const values = new Set<string>();
  const metaTags = head.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metaTags) {
    const nameMatch = tag.match(/\bname\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const name = safeShortText(nameMatch?.[1] ?? nameMatch?.[2] ?? nameMatch?.[3] ?? null, 40);
    if (name?.toLowerCase() !== "generator") continue;
    const contentMatch = tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const content = safeShortText(contentMatch?.[1] ?? contentMatch?.[2] ?? contentMatch?.[3] ?? null, 120);
    if (content) values.add(content);
  }
  return [...values].sort();
}

export function detectTechnologies(result: ScanResult): ScanResult["technologies"] {
  const sources = [
    result.technologies.poweredBy,
    ...result.technologies.generators,
  ].filter((value): value is string => Boolean(value));
  const joined = sources.join(" ").toLowerCase();

  const phpMatch = joined.match(/php\/?(\d+\.\d+(?:\.\d+)?)/);
  const phpVersion = phpMatch ? phpMatch[1] : result.technologies.phpVersion;
  const eolPhpVersions = ["5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0"];
  const phpEol = Boolean(phpVersion && eolPhpVersions.includes(phpVersion));

  let cms: ScanResult["technologies"]["cms"] = null;
  const rules = [
    { name: "WordPress", pattern: /wordpress\s*(\d+\.\d+(?:\.\d+)?)?/, minimum: [6, 0] },
    { name: "Drupal", pattern: /drupal\s*(\d+\.\d+(?:\.\d+)?)?/, minimum: [10, 0] },
    { name: "Joomla", pattern: /joomla!?\s*(\d+\.\d+(?:\.\d+)?)?/, minimum: [5, 0] },
  ];
  for (const rule of rules) {
    const match = joined.match(rule.pattern);
    if (!match) continue;
    const parts = (match[1] ?? "").split(".").map(Number);
    const outdated = parts.length === 0 || parts[0] < rule.minimum[0] ||
      (parts[0] === rule.minimum[0] && (parts[1] ?? 0) < rule.minimum[1]);
    cms = { name: rule.name, version: match[1] ?? null, outdated };
    break;
  }

  return {
    server: result.technologies.server,
    poweredBy: result.technologies.poweredBy,
    via: result.technologies.via,
    cfRay: result.technologies.cfRay,
    generators: result.technologies.generators,
    phpVersion,
    phpEol,
    cms,
  };
}

export function sanitizeScanResult(result: ScanResult): ScanResult {
  return {
    scannedAt: result.scannedAt,
    url: safeUrl(result.url),
    http: {
      status: Number.isInteger(result.http.status) ? result.http.status : 0,
      headers: allowedHeaders(result.http.headers),
    },
    technologies: detectTechnologies(result),
    tls: {
      valid: Boolean(result.tls.valid),
      daysLeft: Number.isFinite(result.tls.daysLeft) ? result.tls.daysLeft : null,
      issuer: safeShortText(result.tls.issuer, 200),
      protocol: safeShortText(result.tls.protocol, 40),
      sans: result.tls.sans
        .map((value) => safeShortText(value, 253))
        .filter((value): value is string => Boolean(value)),
      expiring: Boolean(result.tls.expiring),
    },
    dns: {
      a: Boolean(result.dns.a),
      aaaa: Boolean(result.dns.aaaa),
      mx: Boolean(result.dns.mx),
      spf: Boolean(result.dns.spf),
      dmarc: Boolean(result.dns.dmarc),
      dkimSelectors: result.dns.dkimSelectors
        .map((value) => safeShortText(value, 80))
        .filter((value): value is string => Boolean(value)),
    },
    exposed: result.exposed
      .map((value) => safeShortText(value, 120))
      .filter((value): value is string => Boolean(value)),
    cookieNames: result.cookieNames
      .map((value) => safeShortText(value, 64))
      .filter((value): value is string => Boolean(value)),
  };
}

export function toStoredScanResult(
  result: ScanResult,
  score: ScoreResult,
): StoredScanResult {
  const painFlagSet = new Set<string>(ALLOWED_PAIN_FLAGS);
  return {
    ...sanitizeScanResult(result),
    score: {
      score: score.score,
      tier: score.tier,
      painFlags: score.painFlags.filter((flag) => painFlagSet.has(flag)),
      breakdown: score.breakdown,
    },
  };
}

export function sanitizeDetailPage(page: DetailPage): DetailPage {
  return {
    path: safeUrl(page.path),
    status: Number.isInteger(page.status) ? page.status : 0,
    headers: allowedHeaders(page.headers),
    generators: page.generators
      .map((value) => safeShortText(value, 120))
      .filter((value): value is string => Boolean(value)),
  };
}

export function sanitizeDetailResult(result: DetailScanResult): DetailScanResult {
  return {
    ...sanitizeScanResult(result),
    pages: result.pages.map(sanitizeDetailPage),
  };
}

export function toStoredDetailScanResult(
  result: DetailScanResult,
  score: ScoreResult,
): StoredDetailScanResult {
  return {
    ...toStoredScanResult(result, score),
    pages: result.pages.map(sanitizeDetailPage),
  };
}
