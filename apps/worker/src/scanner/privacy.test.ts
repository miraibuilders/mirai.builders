import assert from "node:assert/strict";
import test from "node:test";
import { buildDetailBrief } from "../detail-brief.js";
import { writeDetailBrief, writeScanResult, type QueryClient } from "../persist.js";
import { scoreScan } from "../scoring/score.js";
import { scanWebsite, scanWebsiteDetailed } from "./scan.js";
import type { ScanSources } from "./types.js";

const fixtureHtml = `<!doctype html>
<html><head>
  <meta name="generator" content="WordPress 5.8">
  <title>[PAGE_TITLE_PLACEHOLDER]</title>
</head><body>
  <h1>Taro Yamada</h1>
  <p>Contact taro.yamada@example.jp or 090-1234-5678.</p>
  <form action="/contact" method="post">
    <input name="full_name" value="Taro Yamada">
    <input name="email" value="taro.yamada@example.jp">
    <input name="phone" value="090-1234-5678">
    <textarea name="message">Private body text</textarea>
  </form>
</body></html>`;

const secrets = ["Taro Yamada", "taro.yamada@example.jp", "090-1234-5678", "Private body text"];

const sources: ScanSources = {
  fetchPage: async () => ({
    status: 200,
    headers: {
      server: "nginx",
      "x-powered-by": "PHP/7.4",
      "set-cookie": "session_id=super-secret-cookie-value; HttpOnly",
    },
    body: fixtureHtml,
  }),
  probePath: async () => 404,
  readTls: async () => ({
    valid: true,
    daysLeft: 60,
    issuer: "Example CA",
    protocol: "TLSv1.3",
    sans: ["example.jp"],
    expiring: false,
  }),
  readDns: async () => ({
    a: true,
    aaaa: false,
    mx: true,
    spf: true,
    dmarc: false,
    dkimSelectors: [],
  }),
};

test("scanner output and every database write contain no personal data from fixture HTML", async () => {
  const result = await scanWebsite("https://example.jp/", sources);
  const score = scoreScan({
    scan: result,
    lead: {
      segment: "professional_office",
      reachability: "referral",
      websitePresent: true,
      sizeProxy: 2,
    },
  });

  const writes: { sql: string; values: unknown[] }[] = [];
  const client: QueryClient = {
    query: async (sql, values = []) => {
      writes.push({ sql, values });
      return undefined;
    },
  };
  await writeScanResult(client, {
    scanId: "00000000-0000-4000-8000-000000000001",
    leadId: "00000000-0000-4000-8000-000000000002",
    result,
    score,
  });

  const resultJson = JSON.stringify(result);
  const databaseWrites = JSON.stringify(writes);
  for (const secret of secrets) {
    assert.ok(!resultJson.includes(secret), `scan result leaked ${secret}`);
    assert.ok(!databaseWrites.includes(secret), `database write leaked ${secret}`);
  }
  assert.ok(!databaseWrites.includes("super-secret-cookie-value"));
  assert.ok(!("body" in result));
  assert.deepEqual(result.cookieNames, ["session_id"]);
  assert.deepEqual(result.technologies.generators, ["WordPress 5.8"]);
  assert.equal(writes.length, 4);
  assert.match(writes[1]?.sql ?? "", /UPDATE scans/);
  assert.match(writes[2]?.sql ?? "", /UPDATE leads/);
});

test("detail pass stores only sanitized metadata and an internal brief", async () => {
  const result = await scanWebsiteDetailed("https://example.jp/", sources);
  const score = scoreScan({
    scan: result,
    lead: {
      segment: "professional_office",
      reachability: "referral",
      websitePresent: true,
      sizeProxy: 2,
    },
  });
  const brief = buildDetailBrief(result);
  const writes: { sql: string; values: unknown[] }[] = [];
  const client: QueryClient = {
    query: async (sql, values = []) => {
      writes.push({ sql, values });
      return undefined;
    },
  };

  await writeDetailBrief(client, {
    scanId: "00000000-0000-4000-8000-000000000003",
    leadId: "00000000-0000-4000-8000-000000000004",
    result,
    score,
    brief,
  });

  const databaseWrites = JSON.stringify(writes);
  for (const secret of secrets) {
    assert.ok(!JSON.stringify(result).includes(secret), `detail result leaked ${secret}`);
    assert.ok(!databaseWrites.includes(secret), `detail write leaked ${secret}`);
  }
  assert.ok(!("body" in result));
  assert.ok(!result.pages.some((page) => "body" in page));
  assert.equal(writes.length, 4);
  assert.match(writes[2]?.sql ?? "", /detail_brief_md/);
});
