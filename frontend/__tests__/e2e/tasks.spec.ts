import { test, expect } from "@playwright/test";

async function loginAsUser(
  page: any,
  email = "john.doe@example.com",
  password = "John@123"
) {
  await page.goto("http://localhost:7878/auth/login");

  await page.getByRole("textbox", { name: "Email address" }).fill(email);

  await page.getByRole("textbox", { name: "Password" }).fill(password);

  await page.getByRole("button", { name: "Log In" }).click();
}

const taskTitle = `E2E Test Task ${Date.now()}`;

test.describe("Task Management - CRUD Operations (Normal User)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("should display dashboard with task list", async ({ page }) => {
    // Check for task stats in sidebar
    await expect(page.getByText(/total tasks/i)).toBeVisible();
    await expect(page.getByText(/in progress/i)).toBeVisible();
    await expect(page.getByText(/done/i)).toBeVisible();

    // Check for filters
    await expect(page.getByPlaceholder(/search for tasks/i)).toBeVisible();
    await expect(
      page.getByRole("combobox").filter({ hasText: "All" })
    ).toBeVisible();

    await expect(
      page
        .getByRole("combobox")
        .filter({ hasText: "Created At (Newest First)" })
    ).toBeVisible();

    //check for profile card
    await expect(
      page
        .locator("div")
        .filter({ hasText: "John Doejohn.doe@example.com" })
        .nth(5)
    ).toBeVisible();
    await expect(page.getByText("USER", { exact: true })).toBeVisible();

    //Check for logout button
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

    //Check for create task button
    await expect(page.getByRole("button", { name: /add task/i })).toBeVisible();

    //Check for theme toggle button
    await expect(
      page.getByRole("button", { name: /toggle theme/i })
    ).toBeVisible();

    await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
    await expect(page.getByRole("button", { name: "List" })).toBeVisible();

    const taskHeadings = page.getByRole("heading", { level: 3 });
    await expect(taskHeadings.first()).toBeVisible();
  });

  test("switches between list and grid views", async ({ page }) => {
    const listBtn = page.getByRole("button", { name: "List" });
    const gridBtn = page.getByRole("button", { name: "Grid" });
    const taskContainer = page.locator("[data-view-mode]");

    // Default is LIST
    await expect(taskContainer).toHaveAttribute("data-view-mode", "list");

    // Switch to GRID
    await gridBtn.click();
    await expect(taskContainer).toHaveAttribute("data-view-mode", "grid");

    // Switch back to LIST
    await listBtn.click();
    await expect(taskContainer).toHaveAttribute("data-view-mode", "list");
  });

  test("should create a new task", async ({ page }) => {
    await page.getByRole("button", { name: /add task/i }).click();

    await page.getByRole("textbox", { name: "Task Title" }).fill(taskTitle);
    await page
      .getByRole("combobox", { name: "Status" })
      .selectOption("completed");

    // Open date picker
    await page.getByRole("button", { name: "MM/DD/YYYY hh:mm aa" }).click();

    // Select a future date (1 days from now to avoid edge cases)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dayButton = page.getByRole("button", {
      name: String(futureDate.getDate()),
      exact: true,
    });

    // Click the day if it's available (not disabled)
    const dayCount = await dayButton.count();
    if (dayCount > 0) {
      await dayButton.first().click();
    }

    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test task for testing");
    await page.getByRole("button", { name: "Create Task" }).click();

    // Verify the task was created and appears on the page
    await expect(page.getByRole("heading", { name: taskTitle })).toBeVisible();
  });

  test("should update an existing task", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: taskTitle })
    ).not.toBeVisible();

    await page.getByRole("button", { name: "Actions" }).first().click();
    await page.getByText("Edit Task").click();

    await page.getByRole("textbox", { name: "Task Title" }).fill(taskTitle);
    await page.getByRole("button", { name: "Update Task" }).click();

    await expect(page.getByRole("heading", { name: taskTitle })).toBeVisible();
  });

  test("should not see delete option for normal user", async ({ page }) => {
    await page.getByRole("button", { name: "Actions" }).first().click();
    expect(page.getByText("Delete Task")).not.toBeVisible();
  });

  test("should update task status", async ({ page }) => {
    await page.getByRole("button", { name: /add task/i }).click();
    const newTaskTitle = `Status Update Test Task ${Date.now()}`;
    await page.getByRole("textbox", { name: "Task Title" }).fill(newTaskTitle);

    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test task for testing");
    await page.getByRole("button", { name: "Create Task" }).click();

    // Wait for dialog to close
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Actions" }).first().click();
    await page.getByText("Update Status").click();
    await page.getByRole("combobox", { name: "Task Status" }).click();
    await page.getByRole("option", { name: "Completed" }).click();
    await page.getByRole("button", { name: "Update Status" }).click();
  });
});

test.describe("Task Management - Admin User", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, "admin@example.com", "Admin@123");
  });

  test("profile shows ADMIN role", async ({ page }) => {
    //check for profile card - just check for the ADMIN badge
    await expect(page.getByText("ADMIN", { exact: true })).toBeVisible();
  });

  test("should see delete option for admin user", async ({ page }) => {
    await page.getByRole("button", { name: /add task/i }).click();
    const newTaskTitle = `Delete Test Task ${Date.now()}`;
    await page.getByRole("textbox", { name: "Task Title" }).fill(newTaskTitle);

    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test task for testing");

    await page.getByRole("button", { name: "Create Task" }).click();

    await page.getByRole("button", { name: "Actions" }).first().click();

    // Cleanup: delete the task
    await page.getByRole("menuitem", { name: "Delete Task" }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify the task was deleted
    await expect(
      page.getByRole("heading", { name: newTaskTitle })
    ).not.toBeVisible();
  });
});
