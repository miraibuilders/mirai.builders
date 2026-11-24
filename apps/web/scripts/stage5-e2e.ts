import assert from "node:assert/strict";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const repoRoot = path.resolve(new URL("../../", import.meta.url).pathname);
const baseUrl = "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/mirai_lab";
const evidenceDir = path.resolve(new URL("../../../state/evidence/stage5/", import.meta.url).pathname);
const fixturePath = path.resolve(new URL("../../../state/fixtures/stage5/stage5-fixture.html", import.meta.url).pathname);
const workerLogPath = path.join(evidenceDir, "worker.log");
const evidencePath = path.join(evidenceDir, "user-path.log");
const manifestPath = path.resolve(new URL("../.next/server/server-reference-manifest.json", import.meta.url).pathname);
const pnpmPath = "/tmp/opencode/bin/pnpm";

let fixtureServer: Server | null = null;
let fixtureUrl = "";
let workerChild: ChildProcess | null = null;

const stamp = Date.now();
const adminEmail = `stage5-admin-${stamp}@example.jp`;
const editorEmail = `stage5-editor-${stamp}@example.jp`;
const password = "stage5-password-123";
const cronCompany = `Stage5 Cron Lead ${stamp}`;
const detailCompany = `Stage5 Detail Lead ${stamp}`;
const editorSlug = `stage5-editor-draft-${stamp}`;
const adminSlug = `stage5-admin-published-${stamp}`;

const evidence: string[] = [];
let cookie = "";

function record(text: string): void {
  evidence.push(text);
  console.log(text);
}

function section(title: string): void {
  record(`\n=== ${title} ===`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uuidFrom(text: string): string {
  const match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.ok(match, `[E2E_ERROR_UUID_NOT_FOUND] ${text}`);
  return match[0];
}

function decodeHtml(value: string): string {
  return value
    .replace(/<!-- -->/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

async function psql(query: string): Promise<string> {
  const { stdout, stderr } = await run(
    "psql",
    ["-h", "localhost", "-p", "5433", "-U", "postgres", "-d", "mirai_lab", "-c", query],
    { env: { ...process.env, PGPASSWORD: "postgres" } },
  );
  const output = `${stdout}${stderr}`.trimEnd();
  record(`$ PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d mirai_lab -c "${query.replace(/"/g, '\\"')}"`);
  record(output);
  return output;
}

async function request(
  label: string,
  requestPath: string,
  options: {
    method?: string;
    body?: BodyInit;
    headers?: Record<string, string>;
    useCookie?: boolean;
    bodyExcerptLength?: number;
  } = {},
): Promise<{ status: number; statusText: string; headers: Headers; body: string }> {
  const method = options.method ?? "GET";
  const url = new URL(requestPath, baseUrl);
  const headers: Record<string, string> = { Origin: baseUrl, ...options.headers };
  if (options.useCookie && cookie) headers.Cookie = cookie;
  const response = await fetch(url, { method, headers, body: options.body, redirect: "manual" });
  const body = await response.text();
  record(`\n[${label}] $ curl -i -X ${method} '${url}'${options.useCookie ? " -H 'Cookie: <SESSION_COOKIE>'" : ""}`);
  record(`HTTP/1.1 ${response.status} ${response.statusText}`);
  for (const name of ["content-type", "location", "set-cookie", "x-action-redirect"]) {
    const value = response.headers.get(name);
    if (value) record(`${name}: ${value}`);
  }
  record(`[BODY_EXCERPT] ${body.replace(/\s+/g, " ").slice(0, options.bodyExcerptLength ?? 500)}`);
  return { status: response.status, statusText: response.statusText, headers: response.headers, body };
}

async function actionId(exportedName: string): Promise<string> {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    node: Record<string, { exportedName?: string }>;
  };
  const found = Object.entries(manifest.node).find(([, value]) => value.exportedName === exportedName);
  assert.ok(found, `[E2E_ERROR_ACTION_NOT_FOUND] ${exportedName}`);
  return found[0];
}

async function callAction(
  label: string,
  pagePath: string,
  exportedName: string,
  fields: Record<string, string>,
): Promise<{ status: number; statusText: string; headers: Headers; body: string }> {
  const form = new FormData();
  form.set(`$ACTION_ID_${await actionId(exportedName)}`, "");
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return request(label, pagePath, {
    method: "POST",
    useCookie: true,
    headers: { Accept: "text/html" },
    body: form,
    bodyExcerptLength: 300,
  });
}

async function waitForLog(pattern: RegExp, timeoutMs = 30000): Promise<RegExpMatchArray> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const log = await readFile(workerLogPath, "utf8").catch(() => "");
    const match = log.match(pattern);
    if (match) return match;
    await sleep(250);
  }
  throw new Error(`[E2E_ERROR_LOG_NOT_FOUND] ${pattern}`);
}

async function waitForPsql(
  query: string,
  predicate: (output: string) => boolean,
  errorMessage: string,
  timeoutMs = 30000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const output = await psql(query);
    if (predicate(output)) return output;
    await sleep(250);
  }
  throw new Error(errorMessage);
}

async function waitForBrief(leadId: string, timeoutMs = 45000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const output = await psql(
      `SELECT CASE WHEN detail_brief_md IS NULL THEN 'pending' ELSE 'ready' END AS brief_state FROM leads WHERE id = '${leadId}';`,
    );
    if (!output.includes("ready")) {
      await sleep(500);
      continue;
    }
    return output;
  }
  throw new Error("[E2E_ERROR_DETAIL_BRIEF_NOT_SET]");
}

async function signUp(label: string, email: string): Promise<void> {
  await request(label, "/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: label, email, password }),
    bodyExcerptLength: 200,
  });
}

async function loginViaUi(label: string, email: string): Promise<string> {
  const page = await request(`${label} login page`, "/login?next=%2Fcms", { bodyExcerptLength: 250 });
  assert.equal(page.status, 200);
  assert.match(page.body, /LOGIN_EMAIL/);
  assert.match(page.body, /LOGIN_PASSWORD/);

  const response = await request(`${label} sign-in from login UI`, "/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, callbackURL: "/cms" }),
    bodyExcerptLength: 200,
  });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie, "[E2E_ERROR_MISSING_SESSION_COOKIE]");
  return setCookie.split(";")[0];
}

async function startFixtureServer(): Promise<string> {
  const html = await readFile(fixturePath, "utf8");
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    if (pathname === "/" || pathname === "/stage5-fixture.html") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string", "[E2E_ERROR_FIXTURE_ADDRESS]");
  fixtureServer = server;
  fixtureUrl = `http://127.0.0.1:${address.port}/stage5-fixture.html`;
  record(`$ fixture server ${fixturePath} -> ${fixtureUrl}`);
  return fixtureUrl;
}

function stopFixtureServer(): void {
  fixtureServer?.close();
  fixtureServer = null;
}

function stopWorker(): void {
  if (!workerChild?.pid) return;
  try {
    process.kill(-workerChild.pid, "SIGTERM");
  } catch {
    workerChild.kill("SIGTERM");
  }
  workerChild = null;
}

async function startWorker(env: Record<string, string>, label: string): Promise<void> {
  await writeFile(workerLogPath, "", "utf8");
  const logFd = fs.openSync(workerLogPath, "a");
  workerChild = spawn(pnpmPath, ["--filter", "worker", "dev"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl,
      ...env,
    },
    stdio: ["ignore", logFd, logFd],
    detached: true,
  });
  workerChild.unref();
  fs.closeSync(logFd);
  record(`$ ${label} ${pnpmPath} --filter worker dev >> ${workerLogPath}`);
}

async function startWorkerWithCron(): Promise<void> {
  await startWorker(
    { SCAN_CRON_TEST: "1", SCAN_INTERVAL_HOURS: "0.01", SCAN_POLL_MS: "200" },
    "SCAN_CRON_TEST=1 SCAN_INTERVAL_HOURS=0.01 SCAN_POLL_MS=200",
  );
}

async function startWorkerWithInterval(): Promise<void> {
  await startWorker(
    { SCAN_CRON_TEST: "0", SCAN_INTERVAL_HOURS: "0.001", SCAN_POLL_MS: "200" },
    "SCAN_CRON_TEST=0 SCAN_INTERVAL_HOURS=0.001 SCAN_POLL_MS=200",
  );
}

async function main(): Promise<void> {
  await mkdir(evidenceDir, { recursive: true });
  section("Standard port preflight");
  await psql("select current_database(), current_setting('server_version') as version;");
  const health = await request("Next health on :3000", "/api/health");
  assert.equal(health.status, 200);
  await startFixtureServer();
  const fixtureResponse = await fetch(fixtureUrl);
  assert.equal(fixtureResponse.status, 200);
  record(`[FIXTURE_SERVER] GET ${fixtureUrl} -> ${fixtureResponse.status}`);

  section("Global (app) auth guard");
  const unauthLeads = await request("unauthenticated /leads", "/leads", { bodyExcerptLength: 200 });
  assert.ok([302, 303, 307, 308].includes(unauthLeads.status));
  assert.equal(unauthLeads.headers.get("location"), "/login?next=%2Fleads");
  record(`[LEADS_UNAUTH] HTTP/1.1 ${unauthLeads.status} location=${unauthLeads.headers.get("location")}`);

  section("Cron lead setup before worker start");
  const cronInsert = await psql(
    `INSERT INTO leads (company, website_url, segment, reachability, size_proxy) VALUES ('${cronCompany}', '${fixtureUrl}', 'professional_office', 'referral', 3) RETURNING id;`,
  );
  const cronLeadId = uuidFrom(cronInsert);
  await psql(`DELETE FROM scans WHERE status IN ('queued', 'running');`);
  await psql(`UPDATE leads SET latest_scan_at = now() + interval '1 hour' WHERE id <> '${cronLeadId}';`);
  await psql(`UPDATE scans SET created_at = now() - interval '1 hour' WHERE created_at > now() - interval '1 hour';`);

  section("Start worker with SCAN_CRON_TEST=1 (test-only)");
  await startWorkerWithCron();
  const cronFired = await waitForLog(/worker: cron fired at (\S+) source=test-startup/);
  const t1 = cronFired[1];
  record(`[WORKER_LOG_T1] ${cronFired[0]}`);
  const enqueued = await waitForLog(new RegExp(`worker: cron enqueued scan=(\\S+) lead=${cronLeadId} .* created_at=(\\S+)`));
  const cronScanId = enqueued[1];
  assert.equal(enqueued[2], t1);
  record(`[WORKER_LOG_ENQUEUE] ${enqueued[0]}`);
  const scansRow = await psql(
    `SELECT id, lead_id, kind, status, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at_iso FROM scans WHERE id = '${cronScanId}';`,
  );
  assert.ok(scansRow.includes(t1), "[E2E_ERROR_SCAN_CREATED_AT_MISMATCH]");
  record(`[SCAN_ROW_CREATED_T1] ${scansRow.replace(/\n/g, " ")}`);

  section("Worker processing and lead update");
  const processing = await waitForLog(new RegExp(`worker: processing job=${cronScanId} kind=scan .* at=(\\S+)`));
  const t2 = processing[1];
  record(`[WORKER_LOG_T2] ${processing[0]}`);
  assert.ok(new Date(t2).getTime() > new Date(t1).getTime(), "[E2E_ERROR_T2_NOT_AFTER_T1]");
  const leadRow = await waitForPsql(
    `SELECT id, score, latest_scan_status, to_char(latest_scan_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS latest_scan_at_iso FROM leads WHERE id = '${cronLeadId}';`,
    (output) => output.includes(t2),
    "[E2E_ERROR_LATEST_SCAN_AT_MISMATCH]",
  );
  record(`[LEAD_ROW_UPDATED_T2] ${leadRow.replace(/\n/g, " ")}`);

  section("Manual re-run cooldown guard");
  cookie = "";
  await signUp("stage5-admin", adminEmail);
  await psql(`UPDATE users SET role = 'admin' WHERE email = '${adminEmail}';`);
  cookie = await loginViaUi("admin", adminEmail);
  const manual = await callAction("manual re-run after completed scan", `/leads/${cronLeadId}`, "triggerLeadScan", {
    leadId: cronLeadId,
  });
  const manualRedirect = manual.headers.get("x-action-redirect") ?? manual.headers.get("location") ?? "";
  assert.match(decodeURIComponent(manualRedirect), /scan ran recently; wait \d+ minutes/);
  const scanCount = await psql(
    `SELECT 'scan_count=' || count(*)::text AS result FROM scans WHERE lead_id = '${cronLeadId}';`,
  );
  assert.match(scanCount, /scan_count=1/);
  record(`[MANUAL_COOLDOWN_MESSAGE] ${decodeURIComponent(manualRedirect)}`);

  section("Detail job and internal brief");
  const detailInsert = await psql(
    `INSERT INTO leads (company, website_url, segment, reachability, size_proxy) VALUES ('${detailCompany}', '${fixtureUrl}', 'professional_office', 'referral', 3) RETURNING id;`,
  );
  const detailLeadId = uuidFrom(detailInsert);
  const detailQueued = await callAction("analyse in detail", `/leads/${detailLeadId}`, "triggerLeadDetailScan", {
    leadId: detailLeadId,
  });
  assert.ok([200, 303].includes(detailQueued.status));
  const detailScanRow = await psql(
    `SELECT id, lead_id, kind, status FROM scans WHERE lead_id = '${detailLeadId}' ORDER BY created_at DESC LIMIT 1;`,
  );
  assert.match(detailScanRow, /detail/);
  const detailScanId = uuidFrom(detailScanRow);
  const detailLog = await waitForLog(new RegExp(`worker: processing job=${detailScanId} kind=detail .* at=(\\S+)`));
  record(`[DETAIL_WORKER_LOG] ${detailLog[0]}`);
  await waitForBrief(detailLeadId);
  const detailPage = await request("lead detail page with brief", `/leads/${detailLeadId}`, {
    useCookie: true,
    bodyExcerptLength: 300,
  });
  assert.equal(detailPage.status, 200);
  assert.match(detailPage.body, /Internal detail brief/);
  const preMatch = detailPage.body.match(/<pre class="lead-detail-brief">([\s\S]*?)<\/pre>/);
  assert.ok(preMatch, "[E2E_ERROR_BRIEF_PRE_NOT_FOUND]");
  const firstTen = decodeHtml(preMatch[1]).split("\n").slice(0, 10).join("\n");
  record("[BRIEF_FIRST_10_LINES_IN_UI]");
  record(firstTen);
  assert.match(firstTen, /Suggested talking points|What the scanner found/);

  cookie = "";
  const publicHome = await request("public landing without session", "/", { bodyExcerptLength: 300 });
  assert.equal(publicHome.status, 200);
  assert.doesNotMatch(publicHome.body, /Internal detail brief/);
  const publicLead = await request("lead detail without session", `/leads/${detailLeadId}`, { bodyExcerptLength: 300 });
  assert.notEqual(publicLead.status, 200);
  assert.doesNotMatch(publicLead.body, /Internal detail brief/);
  record("[BRIEF_VISIBILITY] internal brief absent from public landing and unauthenticated lead request");

  section("CMS role verification through /login UI");
  const unauthCms = await request("unauthenticated /cms", "/cms", { bodyExcerptLength: 200 });
  assert.ok([302, 303, 307, 308].includes(unauthCms.status));
  assert.match(unauthCms.headers.get("location") ?? "", /\/login/);
  record("[CMS_UNAUTH] redirect to login confirmed");

  await signUp("stage5-editor", editorEmail);
  await psql(`UPDATE users SET role = 'editor' WHERE email = '${editorEmail}';`);
  const editorCookie = await loginViaUi("editor", editorEmail);

  cookie = editorCookie;
  const editorCreate = await callAction("editor creates draft post", "/cms/posts/new", "createPost", {
    title: "Stage5 Editor Draft",
    slug: editorSlug,
    bodyMd: "[CMS_BODY_PLACEHOLDER]",
    seoTitle: "",
    seoDescription: "",
    faqJsonLd: "",
  });
  assert.ok([200, 303].includes(editorCreate.status));
  const editorRow = await psql(`SELECT id, title, slug, status, published_at FROM posts WHERE slug = '${editorSlug}';`);
  assert.match(editorRow, /draft/);
  const editorPostId = uuidFrom(editorRow);
  const editorPublishAttempt = await callAction("editor attempts publish", "/cms", "publishPost", {
    postId: editorPostId,
  });
  const editorPublishBody = editorPublishAttempt.body.toLowerCase();
  const editorPublishLocation = editorPublishAttempt.headers.get("location") ?? "";
  assert.ok(
    editorPublishAttempt.status >= 400 ||
      editorPublishBody.includes("cms_forbidden") ||
      /cms_forbidden/i.test(editorPublishLocation),
    "[E2E_ERROR_EDITOR_PUBLISH_NOT_BLOCKED]",
  );
  const editorRowAfter = await psql(`SELECT id, slug, status, published_at FROM posts WHERE id = '${editorPostId}';`);
  assert.match(editorRowAfter, /draft/);
  record(`[EDITOR_PUBLISH_HTTP] HTTP/1.1 ${editorPublishAttempt.status} ${editorPublishAttempt.statusText}`);
  record(`[EDITOR_PUBLISH_LOCATION] ${editorPublishLocation}`);
  record(`[EDITOR_DB_ROW] ${editorRowAfter.replace(/\n/g, " ")}`);

  cookie = await loginViaUi("admin", adminEmail);
  const adminCreate = await callAction("admin creates post", "/cms/posts/new", "createPost", {
    title: "Stage5 Admin Published",
    slug: adminSlug,
    bodyMd: "[CMS_BODY_PLACEHOLDER]",
    seoTitle: "",
    seoDescription: "",
    faqJsonLd: "",
  });
  assert.ok([200, 303].includes(adminCreate.status));
  const adminRowBefore = await psql(`SELECT id, title, slug, status, published_at FROM posts WHERE slug = '${adminSlug}';`);
  const adminPostId = uuidFrom(adminRowBefore);
  const adminPublish = await callAction("admin publishes post", "/cms", "publishPost", {
    postId: adminPostId,
  });
  assert.ok([200, 303].includes(adminPublish.status));
  const finalRows = await psql(
    `SELECT id, slug, status, published_at FROM posts WHERE id IN ('${editorPostId}', '${adminPostId}') ORDER BY slug;`,
  );
  assert.match(finalRows, /draft/);
  assert.match(finalRows, /published/);
  record(`[ADMIN_PUBLISH_HTTP] HTTP/1.1 ${adminPublish.status} ${adminPublish.statusText}`);
  record(`[CMS_FINAL_DB_ROWS] ${finalRows.replace(/\n/g, " ")}`);

  section("Real setInterval cron tick");
  stopWorker();
  await sleep(1000);
  await psql(`UPDATE scans SET created_at = now() - interval '1 hour', updated_at = now() - interval '1 hour' WHERE created_at > now() - interval '1 hour';`);
  await psql(`UPDATE leads SET latest_scan_at = now() + interval '1 hour' WHERE id <> '${cronLeadId}';`);
  await psql(`UPDATE leads SET latest_scan_at = now() - interval '1 hour' WHERE id = '${cronLeadId}';`);
  await startWorkerWithInterval();
  const intervalFired = await waitForLog(/worker: cron fired at (\S+) source=interval/);
  const t3 = intervalFired[1];
  assert.doesNotMatch(await readFile(workerLogPath, "utf8"), /source=test-startup/);
  record(`[INTERVAL_LOG_T3] ${intervalFired[0]}`);
  const intervalEnqueued = await waitForLog(
    new RegExp(`worker: cron enqueued scan=(\\S+) lead=${cronLeadId} .* created_at=(\\S+)`),
  );
  const intervalScanId = intervalEnqueued[1];
  assert.equal(intervalEnqueued[2], t3);
  record(`[INTERVAL_LOG_ENQUEUE] ${intervalEnqueued[0]}`);
  const intervalRow = await waitForPsql(
    `SELECT id, lead_id, kind, status, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at_iso FROM scans WHERE id = '${intervalScanId}';`,
    (output) => output.includes(t3),
    "[E2E_ERROR_INTERVAL_SCAN_CREATED_AT_MISMATCH]",
  );
  assert.match(intervalRow, /scan/);
  record(`[INTERVAL_SCAN_ROW] ${intervalRow.replace(/\n/g, " ")}`);
  const intervalProcessing = await waitForLog(
    new RegExp(`worker: processing job=${intervalScanId} kind=scan .* at=(\\S+)`),
  );
  assert.ok(new Date(intervalProcessing[1]).getTime() > new Date(t3).getTime());
  record(`[INTERVAL_WORKER_LOG] ${intervalProcessing[0]}`);

  record(
    `\n[E2E_OK] cronLead=${cronLeadId} cronScan=${cronScanId} T1=${t1} T2=${t2} intervalScan=${intervalScanId} T3=${t3} detailLead=${detailLeadId} editorPost=${editorPostId} adminPost=${adminPostId}`,
  );
}

main()
  .catch((error) => {
    record(`\n[E2E_ERROR] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    stopWorker();
    stopFixtureServer();
    await writeFile(evidencePath, `${evidence.join("\n")}\n`, "utf8");
  });
