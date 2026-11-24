import assert from "node:assert/strict";
import test from "node:test";
import { DETAIL_PATHS } from "./scanner/checks.js";
import { buildDetailBrief } from "./detail-brief.js";
import type { DetailScanResult } from "./scanner/types.js";

const result: DetailScanResult = {
  scannedAt: "2026-11-22T00:00:00.000Z",
  url: "https://example.jp/",
  http: { status: 200, headers: { server: "nginx" } },
  technologies: {
    server: "nginx",
    poweredBy: "PHP/7.4",
    via: null,
    cfRay: false,
    generators: ["WordPress 5.8"],
    phpVersion: "7.4",
    phpEol: true,
    cms: { name: "WordPress", version: "5.8", outdated: true },
  },
  tls: {
    valid: true,
    daysLeft: 12,
    issuer: "Example CA",
    protocol: "TLSv1.3",
    sans: ["example.jp"],
    expiring: true,
  },
  dns: { a: true, aaaa: false, mx: true, spf: true, dmarc: false, dkimSelectors: [] },
  exposed: [".git/config"],
  cookieNames: ["session_id"],
  pages: DETAIL_PATHS.map((path) => ({
    path: new URL(path, "https://example.jp/").toString(),
    status: path === "/.env" ? 200 : 404,
    headers: {},
    generators: ["WordPress 5.8"],
  })),
};

test("detail allowlist includes favicon and humans plus existing probes", () => {
  assert.ok(DETAIL_PATHS.includes("/favicon.ico"));
  assert.ok(DETAIL_PATHS.includes("/humans.txt"));
  assert.ok(DETAIL_PATHS.includes("/.git/config"));
  assert.ok(!DETAIL_PATHS.some((path) => path.includes("?") || path.includes("#")));
});

test("detail brief has findings, implications and exactly three talking points", () => {
  const brief = buildDetailBrief(result);
  assert.match(brief, /^# Internal detail brief/);
  assert.match(brief, /## What the scanner found/);
  assert.match(brief, /## What it implies/);
  assert.match(brief, /## Suggested talking points for Mika's call/);
  assert.equal(brief.match(/^\d\. /gm)?.length, 3);
  assert.match(brief, /DMARC missing/);
  assert.match(brief, /favicon\.ico/);
  assert.match(brief, /humans\.txt/);
  assert.doesNotMatch(brief, /Private body text/);
});
