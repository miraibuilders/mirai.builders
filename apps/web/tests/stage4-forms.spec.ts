import { expect, test } from "@playwright/test";
import { loginAs, psql, uid } from "./fixtures/helpers";

test("lead and post forms use Stage 1 field primitives", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/leads/new");
  await expect(page.locator('input[name="company"]')).toHaveClass(/ui-input/);
  await expect(page.locator('select[name="segment"]')).toHaveClass(/ui-select/);
  await expect(page.locator('textarea[name="note"]')).toHaveClass(/ui-textarea/);
  await expect(page.getByRole("button", { name: "Create lead" })).toHaveClass(/ui-button/);

  await page.goto("/cms/posts/new");
  await expect(page.locator('input[name="title"]')).toHaveClass(/ui-input/);
  await expect(page.locator('textarea[name="bodyMd"]')).toHaveClass(/ui-textarea/);
  await expect(page.getByRole("button", { name: "Save post" })).toHaveClass(/ui-button/);
});

test("document form keeps success feedback with a status banner", async ({ page }) => {
  const company = `Stage4 ${uid()}`;
  try {
    await loginAs(page, "admin");
    await page.goto("/documents/new");
    await page.locator('input[name="partnerName"]').fill(company);
    await page.locator('input[name="issueDate"]').fill("2026-11-23");
    await page.locator('input[name="issuerName"]').fill("Stage 4 Issuer");
    await page.locator('input[name="invoiceNumber"]').fill("S4-001");
    await page.locator('input[name="item_description[]"]').first().fill("Consulting");
    await page.locator('input[name="item_quantity[]"]').first().fill("1");
    await page.locator('input[name="item_unit_price[]"]').first().fill("1000");
    await page.locator('input[name="item_tax_rate[]"]').first().fill("10");
    await page.getByRole("button", { name: "Create document" }).click();

    const success = page.locator(".document-status.success");
    await expect(success).toBeVisible();
    await expect(success).toHaveAttribute("role", "status");
    await expect(success.getByRole("link", { name: "Download PDF" })).toBeVisible();
  } finally {
    psql(`DELETE FROM documents WHERE partner_name LIKE 'Stage4 e2e%'`);
  }
});

test("site settings uses accessible tabs and an error summary", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/cms/site");

  await page.getByRole("tab", { name: "English" }).click();
  await expect(page.getByRole("tabpanel", { name: "English" })).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: "日本語" })).toBeHidden();

  await page.getByRole("tab", { name: "日本語" }).click();
  await page.getByLabel("Phone", { exact: true }).fill("");
  await page.getByRole("button", { name: "Save site settings" }).click();

  await expect(page.locator('[data-testid="error-phone"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-summary"]')).toBeVisible();
  await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
});

test("DNC settings adds and removes a normalized entry", async ({ page }) => {
  const domain = `stage4-${uid()}.example.jp`;
  try {
    await loginAs(page, "admin");
    await page.goto("/settings/dnc");
    await page.locator('select[name="kind"]').selectOption("domain");
    await page.getByLabel("DNC value").fill(`https://www.${domain}/contact`);
    await page.getByLabel("DNC reason").fill("Stage 4 test");
    await page.getByRole("button", { name: "Add DNC entry" }).click();

    await expect(page).toHaveURL(/notice=DNC%20entry%20saved$/);
    const row = page.locator(".dnc-table tbody tr").filter({ hasText: domain });
    await expect(row).toContainText("domain");
    await expect(row).toContainText("Stage 4 test");

    await row.getByRole("button", { name: "Remove" }).click();
    await expect(page).toHaveURL(/notice=DNC%20entry%20removed$/);
    await expect(page.locator(".dnc-table tbody tr").filter({ hasText: domain })).toHaveCount(0);
  } finally {
    psql(`DELETE FROM do_not_contact WHERE value_norm LIKE 'stage4-e2e%'`);
  }
});
