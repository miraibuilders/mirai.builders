import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
const evidenceDir = path.resolve(new URL("../../../state/evidence/stage4/", import.meta.url).pathname);
const manifestPath = path.resolve(new URL("../.next/server/server-reference-manifest.json", import.meta.url).pathname);
const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/mirai_lab";
const stamp = Date.now();
const adminEmail = `stage4-admin-${stamp}@example.jp`;
const contactEmail = `stage4-contact-${stamp}@example.jp`;
const scanCompany = `Stage4 Scan Lead ${stamp}`;
const fixtureUrl = "http://127.0.0.1:3200/";

const evidence: string[] = [];
let cookie = "";

function record(text: string): void {
  evidence.push(text);
  console.log(text);
}

function section(title: string): void {
  record(`\n=== ${title} ===`);
}

function uuidFrom(text: string): string {
  const match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  assert.ok(match, `[E2E_ERROR_UUID_NOT_FOUND] ${text}`);
  return match[0];
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
): Promise<{ status: number; headers: Headers; body: string }> {
  const method = options.method ?? "GET";
  const url = new URL(requestPath, baseUrl);
  const headers: Record<string, string> = {
    Origin: baseUrl,
    ...(options.useCookie && cookie ? { Cookie: "<SESSION_COOKIE>" } : {}),
    ...options.headers,
  };
  const fetchHeaders: Record<string, string> = { Origin: baseUrl, ...options.headers };
  if (options.useCookie && cookie) fetchHeaders.Cookie = cookie;

  const response = await fetch(url, {
    method,
    headers: fetchHeaders,
    body: options.body,
    redirect: "manual",
  });
  const body = await response.text();
  const selected = [...response.headers.entries()]
    .filter(([name]) => ["content-type", "location", "set-cookie", "x-action-redirect"].includes(name.toLowerCase()))
    .map(([name, value]) => `${name}: ${value}`);
  const excerptLength = options.bodyExcerptLength ?? 900;
  const compactBody = body.replace(/\s+/g, " ").slice(0, excerptLength);

  record(`\n[${label}] $ curl -i -X ${method} '${url}'${options.useCookie ? " -H 'Cookie: <SESSION_COOKIE>'" : ""}`);
  record(`HTTP/1.1 ${response.status} ${response.statusText}`);
  for (const header of selected) record(header);
  record(`[BODY_EXCERPT] ${compactBody}`);
  void headers;
  return { status: response.status, headers: response.headers, body };
}

async function actionId(exportedName: string): Promise<string> {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    node: Record<string, { exportedName?: string; filename?: string }>;
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
): Promise<{ status: number; headers: Headers; body: string }> {
  const form = new FormData();
  form.set(`$ACTION_ID_${await actionId(exportedName)}`, "");
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return request(label, pagePath, {
    method: "POST",
    useCookie: true,
    headers: { Accept: "text/html" },
    body: form,
    bodyExcerptLength: 400,
  });
}

async function waitForText(label: string, requestPath: string, needle: string | RegExp, attempts = 30): Promise<string> {
  let body = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await request(`${label} attempt ${attempt}`, requestPath, { useCookie: true, bodyExcerptLength: 300 });
    body = response.body;
    if (typeof needle === "string" ? body.includes(needle) : needle.test(body)) return body;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`[E2E_ERROR_TEXT_NOT_FOUND] ${String(needle)}`);
}

async function main(): Promise<void> {
  await mkdir(evidenceDir, { recursive: true });
  section("Database and server preflight");
  await psql("select current_database(), current_setting('server_version') as version;");
  const health = await request("health", "/api/health");
  assert.equal(health.status, 200);

  section("Authenticated session");
  const signUp = await request("sign-up", "/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Stage4 Admin", email: adminEmail, password: "stage4-password-123" }),
    bodyExcerptLength: 300,
  });
  assert.equal(signUp.status, 200);
  const setCookie = signUp.headers.get("set-cookie");
  assert.ok(setCookie, "[E2E_ERROR_MISSING_SESSION_COOKIE]");
  cookie = setCookie.split(";")[0];

  const userRow = await psql(`UPDATE users SET role = 'admin' WHERE email = '${adminEmail}' RETURNING id, email, role;`);
  assert.match(userRow, /admin/);

  section("Scan API authorization");
  const unauth = await request("unauthenticated scan", "/api/scans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ leadId: "00000000-0000-4000-8000-000000000000" }),
  });
  assert.equal(unauth.status, 401);

  section("Contact request visible in CRM list");
  const contactInsert = await psql(
    `INSERT INTO contact_requests (name, company, email, phone, message) VALUES ('Stage4 Contact', 'Stage4 Contact Company', '${contactEmail}', '090-9999-8888', 'Stage4 promotion evidence message') RETURNING id, name, company, email, phone, message;`,
  );
  const contactRequestId = uuidFrom(contactInsert);
  const listBefore = await request("contact requests before promotion", "/contact-requests", { useCookie: true });
  assert.equal(listBefore.status, 200);
  assert.match(listBefore.body, new RegExp(contactEmail));
  assert.match(listBefore.body, /Promote to lead/);

  section("Promote contact request to lead");
  const promote = await callAction("promote", "/contact-requests", "promoteContactRequest", { requestId: contactRequestId });
  assert.equal(promote.status, 303);
  const promotedRow = await psql(
    `SELECT cr.id AS contact_request_id, cr.name, cr.email, cr.phone, cr.lead_id, l.id AS lead_id, l.company FROM contact_requests cr LEFT JOIN leads l ON l.id = cr.lead_id WHERE cr.id = '${contactRequestId}';`,
  );
  assert.match(promotedRow, /stage4-contact/);
  assert.doesNotMatch(promotedRow, /\| *null *\|/);
  const promotedLeadRow = await psql(`SELECT lead_id FROM contact_requests WHERE id = '${contactRequestId}';`);
  const promotedLeadId = uuidFrom(promotedLeadRow);
  const listAfter = await request("contact requests after promotion", "/contact-requests", { useCookie: true });
  assert.equal(listAfter.status, 200);
  assert.match(listAfter.body, new RegExp(contactEmail));
  assert.match(listAfter.body, /CONTACT_REQUEST_PROMOTED/);
  const boardAfterPromote = await request("board after promotion", "/leads", { useCookie: true });
  assert.equal(boardAfterPromote.status, 200);
  assert.match(boardAfterPromote.body, /Stage4 Contact Company/);
  assert.match(boardAfterPromote.body, new RegExp(contactEmail));

  section("Create lead in UI path");
  const newLeadPage = await request("new lead page", "/leads/new", { useCookie: true });
  assert.equal(newLeadPage.status, 200);
  const create = await callAction("create lead", "/leads/new", "createLead", {
    company: scanCompany,
    websiteUrl: fixtureUrl,
    segment: "professional_office",
    reachability: "referral",
    sizeProxy: "4",
    nextStep: "[NEXT_STEP_PLACEHOLDER]",
    nextStepDate: "2026-12-01",
    preferredTemplate: "branded",
    note: "[ACTIVITY_NOTE_PLACEHOLDER]",
  });
  assert.equal(create.status, 303);
  const createdRow = await psql(`SELECT id, company, website_url, segment, reachability, size_proxy, stage, score FROM leads WHERE company = '${scanCompany}';`);
  const scanLeadId = uuidFrom(createdRow);

  section("Trigger scan from Kanban path");
  const boardBeforeScan = await request("Kanban board before scan", "/leads", { useCookie: true });
  assert.equal(boardBeforeScan.status, 200);
  assert.match(boardBeforeScan.body, new RegExp(scanLeadId));
  assert.match(boardBeforeScan.body, /LEAD_TRIGGER_SCAN/);
  const queued = await callAction("trigger scan from Kanban", "/leads", "triggerLeadScan", { leadId: scanLeadId });
  assert.ok([200, 303].includes(queued.status));
  const queueRow = await psql(`SELECT id, lead_id, status, created_at FROM scans WHERE lead_id = '${scanLeadId}' ORDER BY created_at DESC LIMIT 1;`);
  const scanId = uuidFrom(queueRow);
  assert.match(queueRow, /queued|running|done/);

  section("Worker completion and score appears without manual refresh");
  let score = 0;
  let scanRow = "";
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    scanRow = await psql(
      `SELECT s.status, s.result_json->'score'->>'score' AS score, s.result_json->'score'->>'tier' AS tier FROM scans s WHERE s.id = '${scanId}';`,
    );
    const match = scanRow.match(/\|\s*(\d+)\s*\|/);
    if (/done/.test(scanRow) && match && Number(match[1]) > 0) {
      score = Number(match[1]);
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert.ok(score > 0, "[E2E_ERROR_SCAN_DID_NOT_COMPLETE]");
  const scorePattern = new RegExp(`Score:\\s*(?:<!-- -->\\s*)?${score}`);
  const boardWithScore = await waitForText("board polling", "/leads", scorePattern);
  assert.match(boardWithScore, scorePattern);
  assert.match(boardWithScore, new RegExp(scanCompany));

  section("Drag card from New to Contacted");
  const boardBeforeDrag = await request("board before drag", "/leads", { useCookie: true });
  assert.match(boardBeforeDrag.body, new RegExp(`data-lead-id="${scanLeadId}" data-stage="new"`));
  const move = await callAction("move stage via drag handler action", "/leads", "moveLeadStage", {
    leadId: scanLeadId,
    stage: "contacted",
  });
  assert.ok([200, 303].includes(move.status));
  const boardAfterDrag = await request("board after drag and reload", "/leads", { useCookie: true });
  assert.match(boardAfterDrag.body, new RegExp(`data-lead-id="${scanLeadId}" data-stage="contacted"`));
  const stageRow = await psql(`SELECT id, company, stage, score FROM leads WHERE id = '${scanLeadId}';`);
  assert.match(stageRow, /contacted/);

  section("Scan result contents");
  await psql(`SELECT id, lead_id, status, result_json FROM scans WHERE id = '${scanId}';`);
  await psql(`SELECT lead_id, note, next_step, next_step_date, created_at FROM lead_activities WHERE lead_id = '${scanLeadId}' ORDER BY created_at DESC;`);

  await writeFile(path.join(evidenceDir, "user-path.log"), `${evidence.join("\n")}\n`, "utf8");
  record(`\n[E2E_OK] contactRequest=${contactRequestId} promotedLead=${promotedLeadId} scanLead=${scanLeadId} scan=${scanId} score=${score}`);
  await writeFile(path.join(evidenceDir, "user-path.log"), `${evidence.join("\n")}\n`, "utf8");
  void databaseUrl;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
