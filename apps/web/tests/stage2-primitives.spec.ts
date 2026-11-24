import { expect, test } from "@playwright/test";

test("demo table sorts, filters, paginates, selects and bulk-actions 100 rows", async ({ page }) => {
  await page.goto("/dev/data-table");
  const table = page.locator("table.ui-table");
  await expect(page.getByText("1–25 of 100")).toBeVisible();
  await expect(table.locator("tbody tr")).toHaveCount(25);

  const scoreHeader = table.locator("th").filter({ hasText: "Score" });
  await scoreHeader.getByRole("button").click();
  await expect(scoreHeader).toHaveAttribute("aria-sort", "ascending");
  await scoreHeader.getByRole("button").click();
  await expect(scoreHeader).toHaveAttribute("aria-sort", "descending");
  const firstScore = Number((await table.locator("tbody tr").first().locator("td").nth(3).textContent())?.trim());
  expect(firstScore).toBeGreaterThanOrEqual(30);

  await page.getByLabel("Segment", { exact: true }).selectOption("retail");
  await expect(page.getByText(/1–\d+ of \d+/)).toBeVisible();
  await page.getByLabel("Segment", { exact: true }).selectOption("");

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("26–50 of 100")).toBeVisible();

  await page.getByLabel("Select all rows on this page").check();
  await expect(page.getByText("25 selected")).toBeVisible();
  await page.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(page.getByText("Last bulk action: reviewed 25")).toBeVisible();
  await expect(page.locator('[data-testid="toast-success"]')).toContainText("Bulk action complete");
});

test("demo table shows loading, error, empty and virtualised states", async ({ page }) => {
  await page.goto("/dev/data-table");
  await page.getByRole("button", { name: "Show loading" }).click();
  await expect(page.locator(".ui-skeleton").first()).toBeVisible();
  await page.getByRole("button", { name: "Stop loading" }).click();

  await page.getByRole("button", { name: "Show error" }).click();
  await expect(page.getByText("Demo server error")).toBeVisible();
  await page.getByRole("button", { name: "Clear error" }).click();

  await page.getByRole("button", { name: "Show empty" }).click();
  await expect(page.getByText("No companies")).toBeVisible();
  await page.getByRole("button", { name: "Restore rows" }).click();

  await page.getByRole("button", { name: "Use 250 rows" }).click();
  await page.getByLabel("Rows per page").selectOption("500");
  await expect(page.getByText(/of 250/)).toBeVisible();
  const rendered = await page.locator("table.ui-table tbody tr:not(.ui-table-spacer)").count();
  expect(rendered).toBeLessThan(40);
});

test("demo kanban drags with optimistic update and persists the move", async ({ page }) => {
  await page.goto("/dev/kanban");
  await page.evaluate(() => window.localStorage.removeItem("mirai-stage2-kanban"));
  await page.reload();
  const newColumn = page.locator('section[aria-label^="New,"]');
  const contactedColumn = page.locator('section[aria-label^="Contacted,"]');
  await expect(newColumn).toContainText("Company 1");

  await page.getByRole("button", { name: /Company 1, score/ }).dragTo(contactedColumn);
  await expect(contactedColumn).toContainText("Company 1");
  await expect(newColumn.getByRole("button", { name: /^Company 1,/ })).toHaveCount(0);
  await expect(page.getByText("Move log: card-1: new → contacted")).toBeVisible();

  await page.reload();
  await expect(contactedColumn).toContainText("Company 1");
});

test("demo kanban moves by keyboard and rolls back on failure", async ({ page }) => {
  await page.goto("/dev/kanban");
  await page.evaluate(() => window.localStorage.removeItem("mirai-stage2-kanban"));
  await page.reload();

  const card = page.getByRole("button", { name: /Company 2, score/ });
  await card.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: "Move Company 2 to stage" });
  await expect(menu).toBeVisible();
  await menu.getByRole("button", { name: "Checking" }).click();
  await expect(page.locator('section[aria-label^="Checking,"]')).toContainText("Company 2");

  const failingCard = page.getByRole("button", { name: /Rollback company, score/ });
  await failingCard.focus();
  await page.keyboard.press("Enter");
  const failMenu = page.getByRole("dialog", { name: "Move Rollback company to stage" });
  await expect(failMenu).toBeVisible();
  await failMenu.getByRole("button", { name: "Won" }).click();
  await expect(page.locator('[data-testid="toast-error"]')).toContainText("Move failed");
  await expect(page.locator('section[aria-label^="Contacted,"]')).toContainText("Rollback company");
});
