import { expect, test } from "@playwright/test";
import { createLeadViaUi, loginAs, uid } from "./fixtures/helpers";

const shellRoutes = [
  "/dashboard",
  "/leads",
  "/leads?view=table",
  "/contact-requests",
  "/documents",
  "/cms",
  "/leads/review",
  "/leads/sources",
  "/settings/dnc",
];

test("internal screens use the shared shell header and one main landmark", async ({ page }) => {
  await loginAs(page, "admin");
  for (const route of shellRoutes) {
    await page.goto(route);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator(".ui-page-header h1")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  }
});

test("lead list uses DataTable controls and preserves legacy selectors", async ({ page }) => {
  const company = `Stage5 table ${uid()}`;
  await loginAs(page, "admin");
  await createLeadViaUi(page, company);
  await page.goto("/leads?view=table");

  await expect(page.locator("table.ui-table.leads-table")).toBeVisible();
  await expect(page.getByLabel("Search leads")).toBeVisible();
  await expect(page.getByRole("group", { name: "Table density" })).toBeVisible();
  await expect(page.locator(`table.leads-table tbody tr[data-lead-id]`, { hasText: company })).toHaveCount(1);
  await page.getByRole("button", { name: "Compact" }).click();
  await expect(page.locator(".ui-table-component")).toHaveAttribute("data-density", "compact");
});

test("lead board uses KanbanBoard and keeps stage/card selectors", async ({ page }) => {
  const company = `Stage5 board ${uid()}`;
  await loginAs(page, "admin");
  const leadId = await createLeadViaUi(page, company);
  await page.goto("/leads");

  await expect(page.locator(".ui-kanban.leads-kanban")).toBeVisible();
  await expect(page.locator("section[data-stage]")).toHaveCount(6);
  const card = page.locator(`.lead-card[data-lead-id="${leadId}"]`);
  await expect(card).toHaveAttribute("data-stage", "new");
  await expect(card).toContainText("Score:");
  await expect(card).toContainText("Tier:");
  await expect(card.getByRole("button", { name: "Trigger scan" })).toBeVisible();
});

test("CMS, documents and contact requests expose DataTable controls", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/cms");
  await expect(page.getByPlaceholder("Search posts")).toBeVisible();
  await expect(page.locator(".ui-table-component")).toBeVisible();

  await page.goto("/documents");
  await expect(page.getByPlaceholder("Search documents")).toBeVisible();
  await expect(page.locator(".ui-table-component")).toBeVisible();

  await page.goto("/contact-requests");
  await expect(page.getByPlaceholder("Search contact requests")).toBeVisible();
  await expect(page.locator(".ui-table-component")).toBeVisible();
});

test("admin review and sources screens show real operational data regions", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/leads/review");
  await expect(page.getByRole("heading", { name: "Review queue", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Needs review" })).toBeVisible();
  await expect(page.getByText("prepared for the screen polish stage")).toHaveCount(0);

  await page.goto("/leads/sources");
  await expect(page.getByRole("heading", { name: "Sources", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pipeline status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent scans" })).toBeVisible();
});
