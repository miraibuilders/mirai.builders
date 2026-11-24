import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { APIRequestContext, Page } from "@playwright/test";

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
export const INDEXNOW_STUB = "http://127.0.0.1:4010";
export const INDEXNOW_KEY = "dev-indexnow-key-9f3a1c7b";
export const SCANNER_URL = "http://127.0.0.1:4020/";
export const EXPECTED_SCORE = 80;

export const CREDENTIALS = {
  admin: { email: "admin@mirai-lab.local", password: "D7-xrLnmFhikjFqRVCDHCNJZ" },
  editor: { email: "editor@mirai-lab.local", password: "RjszYR_TvVHTT9gFNGSXASUH" },
} as const;

export const RUN = `e2e-${Date.now()}`;

export function uid(prefix = RUN): string {
  return `${prefix}-${Math.random().toString(16).slice(2, 8)}`;
}

export function uniqueEmail(local = "contact"): string {
  return `${local}-${uid()}@example.jp`;
}

export function psql(query: string): string {
  return execFileSync(
    "psql",
    ["-h", "127.0.0.1", "-p", "5433", "-U", "postgres", "-d", "mirai_lab", "-At", "-c", query],
    { env: { ...process.env, PGPASSWORD: "postgres" }, encoding: "utf8" },
  ).trim();
}

export function cleanup(): void {
  psql(`DELETE FROM contact_requests WHERE email LIKE '${RUN}%'`);
  psql(`DELETE FROM leads WHERE company LIKE '${RUN}%'`);
  psql(`DELETE FROM documents WHERE partner_name LIKE '${RUN}%'`);
  psql(`DELETE FROM posts WHERE slug LIKE '${RUN}%'`);
  psql("DELETE FROM site_settings WHERE id=1");
  psql("DELETE FROM pricing_tiers");
  psql("DELETE FROM case_studies");
}

export async function loginAs(page: Page, role: keyof typeof CREDENTIALS): Promise<void> {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(CREDENTIALS[role].email);
  await page.locator('input[name="password"]').fill(CREDENTIALS[role].password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
}

export async function cookieHeader(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

const manifestPath = path.join(process.cwd(), ".next", "server", "server-reference-manifest.json");

export async function actionId(exportedName: string): Promise<string> {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    node: Record<string, { exportedName?: string }>;
  };
  const entry = Object.entries(manifest.node).find(([, value]) => value.exportedName === exportedName);
  if (!entry) throw new Error(`server action ${exportedName} not found in ${manifestPath}`);
  return entry[0];
}

export async function callServerAction(
  request: APIRequestContext,
  pagePath: string,
  exportedName: string,
  fields: Record<string, string>,
  cookie = "",
): Promise<{ status: number; headers: Record<string, string>; text: string }> {
  const id = await actionId(exportedName);
  const multipart: Record<string, string> = { [`$ACTION_ID_${id}`]: "", ...fields };
  const response = await request.post(pagePath, {
    multipart,
    headers: cookie
      ? { Cookie: cookie, Accept: "text/html", "x-action-redirect": "navigate" }
      : { Accept: "text/html", "x-action-redirect": "navigate" },
    maxRedirects: 0,
  });
  return { status: response.status(), headers: response.headers(), text: await response.text() };
}

function decode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export async function submitEmptyContactAction(request: APIRequestContext): Promise<string> {
  const html = await (await request.get("/")).text();
  const read = (name: string): string => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = html.match(new RegExp(`name="${escaped}" value="([^"]*)"`));
    if (!match) throw new Error(`missing bound action field ${name}`);
    return decode(match[1]);
  };
  const response = await request.post("/", {
    multipart: {
      $ACTION_REF_1: "",
      "$ACTION_1:0": read("$ACTION_1:0"),
      "$ACTION_1:1": read("$ACTION_1:1"),
      $ACTION_KEY: read("$ACTION_KEY"),
    },
    headers: { Accept: "text/html" },
  });
  return await response.text();
}

export async function indexnowHits(): Promise<unknown[]> {
  const response = await fetch(`${INDEXNOW_STUB}/_hits`);
  if (!response.ok) throw new Error(`stub /_hits returned ${response.status}`);
  return (await response.json()) as unknown[];
}

export async function resetIndexnow(): Promise<void> {
  await fetch(`${INDEXNOW_STUB}/_reset`, { method: "POST" });
}

export async function createPostViaUi(
  page: Page,
  post: { title: string; slug: string; bodyMd: string; seoTitle?: string; seoDescription?: string },
): Promise<string> {
  await page.goto("/cms/posts/new");
  await page.locator('input[name="title"]').fill(post.title);
  await page.locator('input[name="slug"]').fill(post.slug);
  await page.locator('textarea[name="bodyMd"]').fill(post.bodyMd);
  if (post.seoTitle) await page.locator('input[name="seoTitle"]').fill(post.seoTitle);
  if (post.seoDescription) await page.locator('input[name="seoDescription"]').fill(post.seoDescription);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/cms\/posts\/[^/]+\/edit\?notice=Draft%20created$/);
  const match = new URL(page.url()).pathname.match(/\/cms\/posts\/([^/]+)\/edit/);
  if (!match) throw new Error(`unexpected post edit URL: ${page.url()}`);
  return match[1];
}

export async function publishPostViaUi(page: Page, slug: string): Promise<void> {
  await page.goto("/cms");
  const row = page.locator("tr", { hasText: slug });
  await row.getByRole("button", { name: "Publish" }).click();
  await expectNotice(page, "Post published");
}

export async function expectNotice(page: Page, notice: string): Promise<void> {
  await page.waitForURL(new RegExp(`notice=${notice.replaceAll(" ", "%20")}$`));
}

export async function createLeadViaUi(page: Page, company: string, websiteUrl = SCANNER_URL): Promise<string> {
  await page.goto("/leads/new");
  await page.locator('input[name="company"]').fill(company);
  await page.locator('input[name="websiteUrl"]').fill(websiteUrl);
  await page.locator('select[name="segment"]').selectOption("professional_office");
  await page.locator('select[name="reachability"]').selectOption("referral");
  await page.locator('input[name="sizeProxy"]').fill("5");
  await page.locator('input[name="nextStep"]').fill("Send quote");
  await page.locator('textarea[name="note"]').fill(company);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/leads\/[0-9a-f]{8}-[0-9a-f-]{27}$/);
  return new URL(page.url()).pathname.split("/").pop() ?? "";
}

export function waitForScan(leadId: string, timeoutMs = 30000): void {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = psql(`SELECT status FROM scans WHERE lead_id='${leadId}' AND kind='scan' ORDER BY created_at DESC LIMIT 1`);
    if (status === "done" || status === "failed") return;
    execFileSync("sleep", ["1"]);
  }
  throw new Error(`scan for lead ${leadId} did not finish within ${timeoutMs}ms`);
}

export function waitForDetailBrief(leadId: string, timeoutMs = 30000): void {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const brief = psql(`SELECT COALESCE(detail_brief_md,'') FROM leads WHERE id='${leadId}'`);
    if (brief.length > 0) return;
    execFileSync("sleep", ["1"]);
  }
  throw new Error(`detail brief for lead ${leadId} did not appear within ${timeoutMs}ms`);
}
