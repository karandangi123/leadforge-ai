import { expect, test } from "@playwright/test";

test("dashboard smoke flow covers the shipped surfaces", async ({ page }) => {
  await page.goto("/?view=dashboard");
  await expect(page.getByRole("heading", { level: 1, name: "A visibly complete lead workflow." })).toBeVisible();
  await expect(page.getByText("Pipeline command layer")).toBeVisible();

  await page.goto("/?view=roast");
  await expect(page.getByRole("heading", { level: 1, name: "Roast My Website" })).toBeVisible();
  await page.getByLabel("Website URL").fill("https://example.com");
  await page.getByLabel("Optional angle").fill("B2B SaaS");
  await page.getByRole("button", { name: "Generate roast" }).click();
  await expect(page.getByText("Roast complete.")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { level: 2, name: "Revenue opportunity" })).toBeVisible();

  await page.goto("/?view=outreach");
  await expect(page.getByRole("heading", { level: 2, name: "Central review queue" })).toBeVisible();
});
