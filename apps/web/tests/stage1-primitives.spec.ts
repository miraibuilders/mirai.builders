import { expect, test } from "@playwright/test";

test("modal closes on Escape and returns focus to its trigger", async ({ page }) => {
  await page.goto("/dev/components");
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  const trigger = page.getByRole("button", { name: "Open modal", exact: true });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Modal title" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("toast uses role status for success and role alert for error", async ({ page }) => {
  await page.goto("/dev/components");
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Show success toast" }).click();
  const success = page.locator('[data-testid="toast-success"]');
  await expect(success).toBeVisible();
  await expect(success).toHaveAttribute("role", "status");
  await expect(success).toContainText("Saved");

  await page.getByRole("button", { name: "Show error toast" }).click();
  const error = page.locator('[data-testid="toast-error"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveAttribute("role", "alert");
  await expect(error).toContainText("Failed");
});

test("component review page renders every primitive section", async ({ page }) => {
  await page.goto("/dev/components");
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  for (const section of ["tokens", "button", "inputs", "form-field", "badge-avatar", "tooltip", "skeleton", "banner", "toast", "dialog"]) {
    await expect(page.locator(`[data-demo-section="${section}"]`)).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Disabled", exact: true }).first()).toBeDisabled();
});

test("focus outline is visible on focused controls", async ({ page }) => {
  await page.goto("/dev/components");
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  const control = page.getByRole("textbox", { name: "Input focus" });
  await expect(control).toHaveCSS("outline-style", "solid");
  await expect(control).toHaveCSS("outline-width", "3px");
});
