import { expect, test } from "@playwright/test";
import { loginAs } from "./fixtures/helpers";

test("admin shell renders navigation, breadcrumbs and role-aware sections", async ({ page }) => {
  await loginAs(page, "admin");
  await expect(page.locator(".ui-sidebar")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.locator('.ui-sidebar a[href="/dashboard"]')).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Home");
  await expect(page.locator(".ui-sidebar-group").filter({ hasText: "Admin" })).toBeVisible();
  await expect(page.locator('.ui-sidebar a[href="/leads/review"]')).toBeVisible();
  await expect(page.locator('.ui-sidebar a[href="/settings/dnc"]')).toBeVisible();
  await expect(page.getByRole("button", { name: /^Account: / })).toBeVisible();
});

test("editor shell hides admin navigation and palette commands", async ({ page }) => {
  await loginAs(page, "editor");
  await expect(page.locator(".ui-sidebar-group").filter({ hasText: "Admin" })).toHaveCount(0);
  await expect(page.locator('.ui-sidebar a[href="/leads/review"]')).toHaveCount(0);
  await expect(page.locator('.ui-sidebar a[href="/cms"]')).toBeVisible();

  await page.getByRole("button", { name: "Open command palette" }).click();
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox", { name: "Search commands" }).fill("DNC");
  await expect(dialog.getByText("No matching commands")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("command palette opens with Control+K, filters and navigates", async ({ page }) => {
  await loginAs(page, "admin");
  const trigger = page.getByRole("button", { name: "Open command palette" });
  await trigger.click();
  let dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Control+k");
  dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox", { name: "Search commands" }).fill("DNC");
  await expect(dialog.getByRole("option", { name: /DNC/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/settings\/dnc$/);
  await expect(page.getByRole("heading", { name: "DNC", exact: true, level: 1 })).toBeVisible();
});

test("mobile shell exposes drawer navigation and quick bar", async ({ page }) => {
  await loginAs(page, "admin");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".ui-sidebar")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Quick navigation" })).toBeVisible();

  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Leads" }).click();
  await expect(page).toHaveURL(/\/leads$/);
  await expect(drawer).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Quick navigation" }).getByRole("link", { name: "Leads" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
