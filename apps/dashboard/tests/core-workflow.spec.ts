import { expect, test } from "@playwright/test";

test("dashboard smoke flow covers the shipped surfaces", async ({ page }) => {
  // Go to dashboard, which redirects to /login since we are unauthenticated
  await page.goto("/dashboard");

  // Authenticate by entering the demo workspace
  await page.getByRole("button", { name: "Enter Demo Workspace" }).click();

  // Wait for the login redirect to war-room
  await page.waitForURL("**/war-room");

  // Load dashboard view
  await page.goto("/dashboard?view=dashboard");

  await expect(page.getByRole("heading", { level: 1, name: "Your entire outbound pipeline, centralized." })).toBeVisible();
  await expect(page.getByText("Revenue Command Layer")).toBeVisible();

  await page.goto("/dashboard?view=roast");
  await expect(page.getByRole("heading", { level: 1, name: "Roast My Website" })).toBeVisible();
  await page.getByPlaceholder("https://your-site.com").fill("https://example.com");
  await page.getByRole("button", { name: "Run Roast" }).click();
  await expect(page.getByText("Roast complete.")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { level: 2, name: "Revenue Impact" })).toBeVisible();

  await page.goto("/dashboard?view=outreach");
  await expect(page.getByRole("heading", { level: 2, name: "Central review queue" })).toBeVisible();
});
