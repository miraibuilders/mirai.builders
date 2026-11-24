import assert from "node:assert/strict";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { promisify } from "node:util";
import { pingIndexNow } from "../src/lib/indexnow";

const run = promisify(execFile);
const repoRoot = path.resolve(new URL("../../", import.meta.url).pathname);
const e2ePort = 3110;
const stubPort = 4010;
const baseUrl = `http://127.0.0.1:${e2ePort}`;
const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/mirai_lab";
const indexNowKey = "dev-indexnow-key-9f3a1c7b";
const evidenceDir = path.resolve(new URL("../../../state/evidence/stage6/", import.meta.url).pathname);
const evidencePath = path.join(evidenceDir, "user-path.log");
const nextLogPath = path.join(evidenceDir, "next-dev.log");
const manifestPath = path.resolve(new URL("../.next/server/server-reference-manifest.json", import.meta.url).pathname);
const pnpmPath = process.env.PNPM_PATH ?? "pnpm";

const stamp = Date.now();
const adminEmail = `stage6-admin-${stamp}@example.jp`;
const password = "stage6-password-123";
const slug = `stage6-post-${stamp}`;
const title = `Stage6 Post ${stamp}`;

let stubServer: Server | null = null;
let nextChild: ChildProcess | null = null;
let cookie = "";
const stubCalls: Array<{ path: string; body: unknown; status: number }> = [];
const evidence: string[] = [];

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
  record(`[BODY_EXCERPT] ${body.replace(/\s+/g, " ").slice(0, options.bodyExcerptLength ?? 400)}`);
  return { status: response.status, headers: response.headers, body };
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
): Promise<{ status: number; headers: Headers; body: string }> {
  const form = new FormData();
  form.set(`$ACTION_ID_${await actionId(exportedName)}`, "");
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return request(label, pagePath, {
    method: "POST",
    useCookie: true,
    headers: { Accept: "text/html" },
    body: form,
    bodyExcerptLength: 250,
  });
}

async function waitForActions(): Promise<void> {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
        node: Record<string, { exportedName?: string }>;
      };
      const names = new Set(Object.values(manifest.node).map((value) => value.exportedName));
      if (["createPost", "updatePost", "publishPost"].every((name) => names.has(name))) return;
    } catch {
      /* manifest still being written */
    }
    await sleep(500);
  }
  throw new Error("[E2E_ERROR_ACTIONS_NOT_READY]");
}

async function waitForNext(): Promise<void> {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { redirect: "manual" });
      if (response.status === 200 && fs.existsSync(manifestPath)) return;
    } catch {
      /* dev server still starting */
    }
    await sleep(500);
  }
  throw new Error("[E2E_ERROR_NEXT_NOT_READY]");
}

function startStubServer(): Promise<void> {
  stubServer = createServer((incoming, response) => {
    const chunks: Buffer[] = [];
    incoming.on("data", (chunk: Buffer) => chunks.push(chunk));
    incoming.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      const pathname = new URL(incoming.url ?? "/", "http://127.0.0.1").pathname;
      if (pathname === "/indexnow" && incoming.method === "POST") {
        let body: unknown = null;
        try {
          body = JSON.parse(raw);
        } catch {
          body = raw;
        }
        stubCalls.push({ path: pathname, body, status: 202 });
        response.writeHead(202, { "content-type": "application/json" });
        response.end('{"ok":true}');
        return;
      }
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("not found");
    });
  });
  return new Promise((resolve, reject) => {
    stubServer?.once("error", reject);
    stubServer?.listen(stubPort, "127.0.0.1", () => resolve());
  });
}

function stopStubServer(): void {
  if (!stubServer) return;
  stubServer.closeAllConnections?.();
  stubServer.close();
  stubServer = null;
}

function stopNext(): void {
  if (!nextChild?.pid) return;
  try {
    process.kill(-nextChild.pid, "SIGTERM");
  } catch {
    nextChild.kill("SIGTERM");
  }
  nextChild = null;
}

function startNext(): void {
  const logFd = fs.openSync(nextLogPath, "w");
  nextChild = spawn(
    pnpmPath,
    ["--filter", "@mirai/web", "exec", "next", "dev", "-p", String(e2ePort)],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        NODE_ENV: "development",
        DATABASE_URL: databaseUrl,
        BETTER_AUTH_SECRET: "local-dev-stage6-e2e-secret",
        BETTER_AUTH_URL: baseUrl,
        SITE_ORIGIN: baseUrl,
        INDEXNOW_ENABLED: "true",
        INDEXNOW_ENDPOINT: `http://127.0.0.1:${stubPort}/indexnow`,
        INDEXNOW_KEY: indexNowKey,
      },
      stdio: ["ignore", logFd, logFd],
      detached: true,
    },
  );
  nextChild.unref();
  fs.closeSync(logFd);
  record(`$ INDEXNOW_ENABLED=true INDEXNOW_ENDPOINT=http://127.0.0.1:${stubPort}/indexnow ${pnpmPath} --filter @mirai/web exec next dev -p ${e2ePort} >> ${nextLogPath}`);
  record("[E2E_NEXT_PORT_NOTE] :3110 is E2E-only, not part of the standard port contract.");
}

async function main(): Promise<void> {
  await mkdir(evidenceDir, { recursive: true });

  section("E2E port preflight");
  for (const port of [e2ePort, stubPort]) {
    const { stdout } = await run("lsof", ["-iTCP:" + port, "-sTCP:LISTEN", "-P", "-n"]).catch(() => ({ stdout: "" }));
    assert.equal(stdout.trim(), "", `[E2E_ERROR_PORT_BUSY] :${port}`);
    record(`:${port} free`);
  }

  section("Start throwaway IndexNow stub");
  await startStubServer();
  record(`$ stub HTTP server listening on 127.0.0.1:${stubPort}/indexnow -> 202`);

  section("Start throwaway Next dev on E2E-only :3110");
  startNext();
  await waitForNext();
  record("[E2E_NEXT_READY] /api/health 200 and server-reference-manifest.json present");

  section("Verification file and key file");
  const keyFile = await request("key file", `/${indexNowKey}.txt`, { bodyExcerptLength: 100 });
  assert.equal(keyFile.status, 200);
  assert.equal(keyFile.body.trim(), indexNowKey);
  record("[E2E_KEY_FILE] 200 and body equals INDEXNOW_KEY");
  const robots = await request("robots.txt", "/robots.txt", { bodyExcerptLength: 200 });
  assert.equal(robots.status, 200);
  assert.match(robots.body, /User-Agent/i);
  record("[E2E_ROBOTS] /robots.txt still returns the robots file (no catch-all .txt route)");

  section("Admin test user");
  const signup = await request("sign-up admin", "/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Stage6 Admin", email: adminEmail, password }),
    bodyExcerptLength: 150,
  });
  assert.equal(signup.status, 200);
  const promote = await psql(`UPDATE users SET role = 'admin' WHERE email = '${adminEmail}';`);
  assert.match(promote, /UPDATE 1/);
  const login = await request("sign-in admin", "/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password, callbackURL: "/cms" }),
    bodyExcerptLength: 150,
  });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get("set-cookie");
  assert.ok(setCookie, "[E2E_ERROR_MISSING_SESSION_COOKIE]");
  cookie = setCookie.split(";")[0];

  section("Compile CMS server actions in dev");
  const cmsPage = await request("cms page", "/cms", {
    useCookie: true,
    bodyExcerptLength: 200,
  });
  assert.equal(cmsPage.status, 200);
  await waitForActions();
  record("[E2E_ACTIONS_READY] createPost / updatePost / publishPost present in dev manifest");

  const faq = {
    mainEntity: [
      {
        "@type": "Question",
        name: "[FAQ_QUESTION]",
        acceptedAnswer: { "@type": "Answer", text: "[FAQ_ANSWER]" },
      },
    ],
  };
  const bodyMd = "## Heading\n\nThis is **bold** text.";

  section("Trap A — draft must not ping IndexNow");
  const created = await callAction("create draft", "/cms/posts/new", "createPost", {
    title,
    slug,
    bodyMd,
    seoTitle: title,
    seoDescription: "[STAGE6_SEO_DESCRIPTION]",
    faqJsonLd: JSON.stringify(faq),
  });
  assert.equal(created.status, 303);
  const postId = uuidFrom(created.headers.get("location") ?? "");
  record(`[E2E_POST_ID] ${postId}`);
  const updated = await callAction("update draft", `/cms/posts/${postId}/edit`, "updatePost", {
    postId,
    title,
    slug,
    bodyMd,
    seoTitle: title,
    seoDescription: "[STAGE6_SEO_DESCRIPTION]",
    faqJsonLd: JSON.stringify(faq),
  });
  assert.equal(updated.status, 303);
  assert.equal(stubCalls.length, 0, "[E2E_ERROR_DRAFT_PINGED]");
  record("[E2E_TRAP_A] draft create/update produced zero IndexNow POSTs");

  section("Trap B — publish pings exactly once");
  const published = await callAction("publish post", "/cms", "publishPost", { postId });
  assert.equal(published.status, 303);
  assert.equal(stubCalls.length, 1, "[E2E_ERROR_EXPECTED_ONE_PING]");
  const call = stubCalls[0];
  assert.equal(call.status, 202);
  assert.equal(call.path, "/indexnow");
  const pingBody = call.body as {
    host: string;
    key: string;
    keyLocation: string;
    urlList: string[];
  };
  assert.equal(pingBody.host, `127.0.0.1:${e2ePort}`);
  assert.equal(pingBody.key, indexNowKey);
  assert.equal(pingBody.keyLocation, `${baseUrl}/${indexNowKey}.txt`);
  assert.deepEqual(pingBody.urlList, [`${baseUrl}/blog/${slug}`]);
  record(`[E2E_TRAP_B] one POST, status 202, body=${JSON.stringify(pingBody)}`);
  const nextLog = await readFile(nextLogPath, "utf8");
  assert.match(nextLog, /indexnow: request/);
  assert.match(nextLog, /indexnow: response status=202/);
  record("[E2E_TRAP_B_LOG] next-dev.log contains request body and response status 202");

  section("Trap C — SSR page: BlogPosting JSON-LD, FAQ, rendered markdown");
  const article = await request("blog article", `/blog/${slug}`, { bodyExcerptLength: 300 });
  assert.equal(article.status, 200);
  const jsonLd = [...article.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1]) as Record<string, unknown>,
  );
  const blogPosting = jsonLd.find((value) => value["@type"] === "BlogPosting");
  assert.ok(blogPosting, "[E2E_ERROR_BLOGPOSTING_MISSING]");
  assert.equal(blogPosting["@type"], "BlogPosting");
  record(`[E2E_TRAP_C_TYPE] ${String(blogPosting["@type"])}`);
  assert.equal(blogPosting.headline, title);
  assert.equal(blogPosting.url, `${baseUrl}/blog/${slug}`);
  const faqPage = jsonLd.find((value) => value["@type"] === "FAQPage");
  assert.ok(faqPage, "[E2E_ERROR_FAQPAGE_MISSING]");
  record("[E2E_TRAP_C_FAQ] FAQPage JSON-LD present");
  assert.match(article.body, /<h2>Heading<\/h2>/);
  assert.match(article.body, /<strong>bold<\/strong>/);
  assert.doesNotMatch(article.body, /## Heading/);
  assert.doesNotMatch(article.body, /\*\*bold\*\*/);
  record("[E2E_TRAP_C_MARKDOWN] <h2>Heading</h2> and <strong>bold</strong> rendered, no literal markdown");
  const listing = await request("blog index", "/blog", { bodyExcerptLength: 200 });
  assert.equal(listing.status, 200);
  assert.match(listing.body, new RegExp(slug));
  record("[E2E_BLOG_INDEX] published post listed");

  section("Trap D — disabled ping logs and makes no HTTP call");
  const originalEnabled = process.env.INDEXNOW_ENABLED;
  const logs: string[] = [];
  const originalLog = console.log;
  process.env.INDEXNOW_ENABLED = "false";
  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  let disabledResult;
  try {
    disabledResult = await pingIndexNow([`${baseUrl}/blog/disabled`]);
  } finally {
    console.log = originalLog;
    if (originalEnabled === undefined) delete process.env.INDEXNOW_ENABLED;
    else process.env.INDEXNOW_ENABLED = originalEnabled;
  }
  assert.equal(disabledResult.skipped, true);
  assert.ok(logs.some((line) => line.includes("indexnow: disabled")), "[E2E_ERROR_DISABLED_LOG_MISSING]");
  assert.equal(stubCalls.length, 1, "[E2E_ERROR_DISABLED_STILL_PINGED]");
  record("[E2E_TRAP_D] logged 'indexnow: disabled' and stub call count stayed at 1");

  record("\n[E2E_OK] traps A/B/C/D passed");
}

main()
  .catch((error) => {
    record(`[E2E_FAILED] ${String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    stopNext();
    stopStubServer();
    await sleep(500);
    await writeFile(evidencePath, `${evidence.join("\n")}\n`, "utf8");
    console.log(`[E2E_EVIDENCE] ${evidencePath}`);
  });
