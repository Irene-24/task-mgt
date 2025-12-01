import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("should display login page", async ({ page }) => {
    await expect(page).toHaveTitle(/Task Manager/i);
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/please provide a valid email/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.getByLabel(/email address/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /log in/i }).click();

    // Wait for navigation or error (could be "Unable to log in" or similar)
    await page.waitForTimeout(2000);

    // Should still be on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Using seeded user credentials
    await page.getByLabel(/email address/i).fill("john.doe@example.com");
    await page.getByLabel(/password/i).fill("John@123");
    await page.getByRole("button", { name: /log in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Should see dashboard elements
    await expect(page.getByText(/total tasks/i)).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.getByRole("link", { name: /sign up instead/i }).click();

    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.getByText(/create account/i)).toBeVisible();
  });
});

test.describe("Register Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });

  test("should display register page", async ({ page }) => {
    await expect(page.getByText(/create account/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
  });

  test("should validate password requirements", async ({ page }) => {
    await page.getByLabel(/email address/i).fill("test@example.com");
    await page.getByLabel(/first name/i).fill("Test");
    await page.getByLabel(/last name/i).fill("User");
    await page.getByLabel("Password", { exact: true }).fill("weak");
    await page.getByLabel(/confirm password/i).fill("weak");
    await page.getByRole("button", { name: /create account/i }).click();

    // Should show password validation errors
    await expect(
      page.getByText(/password must be at least 6 characters/i)
    ).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: /sign in instead/i }).click();

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });
});

test.describe("Logout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.getByLabel(/email address/i).fill("john.doe@example.com");
    await page.getByLabel(/password/i).fill("John@123");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should logout successfully", async ({ page }) => {
    // Click logout button in sidebar
    await page.getByRole("button", { name: /logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
  });
});
