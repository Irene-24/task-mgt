import Task from "@/models/Task.model";
import { TaskStatus } from "@/utils/constants";
import { createTestUser } from "../utils/testHelpers";
import { validTaskData } from "../utils/fixtures";

describe("Task Model", () => {
  let userId: any;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id;
  });

  describe("Schema Validation", () => {
    it("should create a task with valid data", async () => {
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
      });

      expect(task.title).toBe(validTaskData.title);
      expect(task.description).toBe(validTaskData.description);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.createdBy.toString()).toBe(userId.toString());
    });

    it("should fail without required fields", async () => {
      await expect(Task.create({})).rejects.toThrow();
    });

    it("should fail with title less than 3 characters", async () => {
      await expect(
        Task.create({
          title: "AB",
          description: validTaskData.description,
          createdBy: userId,
        })
      ).rejects.toThrow();
    });

    it("should fail with title more than 100 characters", async () => {
      await expect(
        Task.create({
          title: "A".repeat(101),
          description: validTaskData.description,
          createdBy: userId,
        })
      ).rejects.toThrow();
    });

    it("should fail with description less than 10 characters", async () => {
      await expect(
        Task.create({
          title: validTaskData.title,
          description: "Short",
          createdBy: userId,
        })
      ).rejects.toThrow();
    });

    it("should default status to PENDING", async () => {
      const task = await Task.create({
        title: validTaskData.title,
        description: validTaskData.description,
        createdBy: userId,
      });
      expect(task.status).toBe(TaskStatus.PENDING);
    });

    it("should accept assignedTo field", async () => {
      const assignedUser = await createTestUser({
        email: "assigned@example.com",
      });
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
        assignedTo: assignedUser._id,
      });

      expect(task.assignedTo?.toString()).toBe(assignedUser._id.toString());
    });
  });

  describe("Instance Methods", () => {
    it("should toggle status from PENDING to COMPLETED", async () => {
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
        status: TaskStatus.PENDING,
      });

      await task.toggleStatus();
      expect(task.status).toBe(TaskStatus.COMPLETED);
    });

    it("should toggle status from COMPLETED to PENDING", async () => {
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
        status: TaskStatus.COMPLETED,
      });

      await task.toggleStatus();
      expect(task.status).toBe(TaskStatus.PENDING);
    });

    it("should mark task as completed", async () => {
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
      });

      await task.markAsCompleted();
      expect(task.status).toBe(TaskStatus.COMPLETED);
    });

    it("should mark task as pending", async () => {
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
        status: TaskStatus.COMPLETED,
      });

      await task.markAsPending();
      expect(task.status).toBe(TaskStatus.PENDING);
    });
  });

  describe("Indexes", () => {
    it("should have text index on title and description", async () => {
      const indexes = await Task.collection.getIndexes();
      // Check for text index by looking for the key containing "_fts"
      const hasTextIndex = Object.keys(indexes).some((key) =>
        key.includes("title_text_description_text")
      );
      expect(hasTextIndex).toBe(true);
    });

    it("should have compound index on createdBy and status", async () => {
      const indexes = await Task.collection.getIndexes();
      expect(indexes).toHaveProperty("createdBy_1_status_1");
    });

    it("should have index on assignedTo", async () => {
      const indexes = await Task.collection.getIndexes();
      expect(indexes).toHaveProperty("assignedTo_1");
    });
  });

  describe("Timestamps", () => {
    it("should add createdAt and updatedAt timestamps", async () => {
      const task = await Task.create({
        ...validTaskData,
        createdBy: userId,
      });

      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("Text Search", () => {
    beforeEach(async () => {
      await Task.create({
        title: "Buy groceries",
        description: "Need to buy milk, eggs, and bread from the store",
        createdBy: userId,
      });
      await Task.create({
        title: "Write report",
        description: "Complete the quarterly financial report for management",
        createdBy: userId,
      });
      await Task.create({
        title: "Fix bug",
        description: "Debug and fix the login authentication issue",
        createdBy: userId,
      });
    });

    it("should find tasks by title text search", async () => {
      const tasks = await Task.find({ $text: { $search: "groceries" } });
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Buy groceries");
    });

    it("should find tasks by description text search", async () => {
      const tasks = await Task.find({ $text: { $search: "report" } });
      expect(tasks.length).toBeGreaterThanOrEqual(1);
      expect(tasks[0].description).toContain("report");
    });

    it("should find multiple tasks with common words", async () => {
      const tasks = await Task.find({ $text: { $search: "fix debug" } });
      expect(tasks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
