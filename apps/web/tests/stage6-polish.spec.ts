import { expect, test } from "@playwright/test";
import { createLeadViaUi, loginAs, uid } from "./fixtures/helpers";

const tableRoutes = [
  "/leads?view=table",
  "/contact-requests",
  "/documents",
  "/cms",
  "/leads/review",
  "/leads/sources",
  "/cms/authors",
  "/cms/media",
  "/settings/dnc",
];

test("premium table surfaces preserve data selectors", async ({ page }) => {
  await loginAs(page, "admin");

  for (const route of tableRoutes) {
    await page.goto(route);
    const viewport = page.locator(".ui-table-viewport").first();
    const table = page.locator("table.ui-table").first();
    await expect(viewport).toBeVisible();
    await expect(table).toBeVisible();
    await expect(table.locator("thead th").first()).toBeVisible();

    const position = await table.locator("thead th").first().evaluate((element) => getComputedStyle(element).position);
    const radius = await viewport.evaluate((element) => getComputedStyle(element).borderRadius);
    expect(position).toBe("sticky");
    expect(radius).not.toBe("0px");
  }
});

test("lead activity table adopts the shared table treatment", async ({ page }) => {
  const company = `Stage6 activity ${uid()}`;
  await loginAs(page, "admin");
  const leadId = await createLeadViaUi(page, company);

  await page.goto(`/leads/${leadId}`);
  await expect(page.locator("table.lead-activity-list.ui-table")).toBeVisible();
  await expect(page.locator("table.lead-activity-list caption.ui-sr-only")).toContainText("Lead activity history");
});

test("command palette and submit buttons have tactile microinteractions", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/settings/dnc");

  const submit = page.getByRole("button", { name: "Add DNC entry" });
  await expect(submit).toHaveClass(/ui-button/);
  const buttonTransition = await submit.evaluate((element) => getComputedStyle(element).transitionProperty);
  expect(buttonTransition).toContain("transform");

  await page.keyboard.press("Control+k");
  const palette = page.locator('.ui-dialog-layer[data-variant="palette"]');
  await expect(palette).toBeVisible();
  expect(await page.locator(".ui-command-list li").count()).toBeGreaterThan(0);

  const commandTransition = await page
    .locator(".ui-command-list li")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionProperty);
  expect(commandTransition).toContain("transform");

  await page.keyboard.press("Escape");
  await expect(palette).toHaveCount(0);
});

test("dialogs and toasts use elevated message surfaces", async ({ page }) => {
  await page.goto("/dev/components");
  await page.getByRole("button", { name: "Open confirmation" }).click();

  const dialog = page.locator(".ui-dialog-panel");
  await expect(dialog).toBeVisible();
  const dialogStyle = await dialog.evaluate((element) => {
    const style = getComputedStyle(element);
    return { radius: style.borderRadius, shadow: style.boxShadow };
  });
  expect(dialogStyle.radius).not.toBe("0px");
  expect(dialogStyle.shadow).not.toBe("none");

  const backdropFilter = await page.locator(".ui-dialog-backdrop").evaluate((element) => getComputedStyle(element).backdropFilter);
  expect(backdropFilter).toContain("blur");

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);

  await page.getByRole("button", { name: "Show success toast" }).click();
  const toast = page.locator(".ui-toast").first();
  await expect(toast).toBeVisible();
  const toastShadow = await toast.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(toastShadow).not.toBe("none");
});
