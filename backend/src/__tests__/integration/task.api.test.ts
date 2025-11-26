import request from "supertest";
import { Application } from "express";
import { createTestApp } from "../utils/testApp";
import {
  createTestUser,
  createTestAdmin,
  createTestTask,
  generateTestAccessToken,
  cleanDatabase,
  getAuthHeader,
} from "../utils/testHelpers";
import { TaskStatus } from "@/utils/constants";
import { validTaskData } from "../utils/fixtures";

describe("Task API Integration Tests", () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe("GET /v1/tasks/stats", () => {
    it("should get task statistics for authenticated user", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      await createTestTask(user._id, { status: TaskStatus.PENDING });
      await createTestTask(user._id, { status: TaskStatus.COMPLETED });
      await createTestTask(user._id, { status: TaskStatus.COMPLETED });

      const response = await request(app)
        .get("/v1/tasks/stats")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.stats).toMatchObject({
        total: 3,
        pending: 1,
        completed: 2,
      });
    });

    it("should return zero stats for user with no tasks", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .get("/v1/tasks/stats")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.stats).toMatchObject({
        total: 0,
        pending: 0,
        completed: 0,
      });
    });

    it("should fail without authentication", async () => {
      await request(app).get("/v1/tasks/stats").expect(401);
    });
  });

  describe("POST /v1/tasks", () => {
    it("should create a new task", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .post("/v1/tasks")
        .set(getAuthHeader(token))
        .send(validTaskData)
        .expect(201);

      expect(response.body.task).toMatchObject({
        title: validTaskData.title,
        description: validTaskData.description,
        status: TaskStatus.PENDING,
      });
      expect(response.body.task.createdBy).toBe(user._id.toString());
    });

    it("should create task with assignedTo field", async () => {
      const user = await createTestUser();
      const assignee = await createTestUser({ email: "assignee@example.com" });
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .post("/v1/tasks")
        .set(getAuthHeader(token))
        .send({
          ...validTaskData,
          assignedTo: assignee._id.toString(),
        })
        .expect(201);

      expect(response.body.task.assignedTo).toBe(assignee._id.toString());
    });

    it("should fail with invalid title length", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .post("/v1/tasks")
        .set(getAuthHeader(token))
        .send({ ...validTaskData, title: "AB" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail with short description", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .post("/v1/tasks")
        .set(getAuthHeader(token))
        .send({ ...validTaskData, description: "Short" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without authentication", async () => {
      await request(app).post("/v1/tasks").send(validTaskData).expect(401);
    });
  });

  describe("GET /v1/tasks", () => {
    it("should get all tasks for user (created or assigned)", async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser({ email: "other@example.com" });
      const token = generateTestAccessToken(user._id, user.role);

      await createTestTask(user._id, { title: "My Task 1" });
      await createTestTask(user._id, { title: "My Task 2" });
      await createTestTask(otherUser._id, {
        title: "Assigned to me",
        assignedTo: user._id,
      });
      await createTestTask(otherUser._id, { title: "Not mine" });

      const response = await request(app)
        .get("/v1/tasks")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.tasks).toHaveLength(3); // 2 created + 1 assigned
      expect(response.body).toHaveProperty("hasMore");
      expect(response.body).toHaveProperty("nextCursor");
    });

    it("should filter tasks by status", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      await createTestTask(user._id, { status: TaskStatus.PENDING });
      await createTestTask(user._id, { status: TaskStatus.COMPLETED });

      const response = await request(app)
        .get("/v1/tasks?status=pending")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe(TaskStatus.PENDING);
    });

    it("should search tasks by text", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      await createTestTask(user._id, { title: "Buy groceries" });
      await createTestTask(user._id, { title: "Write report" });

      const response = await request(app)
        .get("/v1/tasks?search=groceries")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toContain("groceries");
    });

    it("should support pagination with cursor", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      for (let i = 0; i < 5; i++) {
        await createTestTask(user._id, { title: `Task ${i}` });
      }

      const response1 = await request(app)
        .get("/v1/tasks?limit=3")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response1.body.tasks).toHaveLength(3);
      expect(response1.body.hasMore).toBe(true);
      expect(response1.body.nextCursor).toBeDefined();

      const response2 = await request(app)
        .get(`/v1/tasks?limit=3&cursor=${response1.body.nextCursor}`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response2.body.tasks).toHaveLength(2);
      expect(response2.body.hasMore).toBe(false);
    });

    it("should sort tasks by createdAt", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      await createTestTask(user._id, { title: "First" });
      await new Promise((resolve) => setTimeout(resolve, 100));
      await createTestTask(user._id, { title: "Second" });

      const response = await request(app)
        .get("/v1/tasks?sortOrder=desc")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.tasks[0].title).toBe("Second");
    });

    it("should fail without authentication", async () => {
      await request(app).get("/v1/tasks").expect(401);
    });
  });

  describe("GET /v1/tasks/:id", () => {
    it("should get task by id if user is creator", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);
      const task = await createTestTask(user._id);

      const response = await request(app)
        .get(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.task).toMatchObject({
        title: task.title,
        description: task.description,
      });
    });

    it("should get task if user is assignee", async () => {
      const user = await createTestUser();
      const creator = await createTestUser({ email: "creator@example.com" });
      const token = generateTestAccessToken(user._id, user.role);
      const task = await createTestTask(creator._id, { assignedTo: user._id });

      const response = await request(app)
        .get(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.task.id).toBe(task._id.toString());
    });

    it("should fail if user has no access to task", async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: "user2@example.com" });
      const token = generateTestAccessToken(user1._id, user1.role);
      const task = await createTestTask(user2._id);

      const response = await request(app)
        .get(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .expect(403);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail with invalid task id", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      await request(app)
        .get("/v1/tasks/invalid-id")
        .set(getAuthHeader(token))
        .expect(400);
    });

    it("should fail without authentication", async () => {
      const user = await createTestUser();
      const task = await createTestTask(user._id);

      await request(app).get(`/v1/tasks/${task._id}`).expect(401);
    });
  });

  describe("PATCH /v1/tasks/:id", () => {
    it("should update task as creator", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);
      const task = await createTestTask(user._id);

      const response = await request(app)
        .patch(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .send({
          title: "Updated Title",
          status: TaskStatus.COMPLETED,
        })
        .expect(200);

      expect(response.body.task.title).toBe("Updated Title");
      expect(response.body.task.status).toBe(TaskStatus.COMPLETED);
    });

    it("should fail to update task not created by user", async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: "user2@example.com" });
      const token = generateTestAccessToken(user1._id, user1.role);
      const task = await createTestTask(user2._id);

      const response = await request(app)
        .patch(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .send({ title: "Hacked" })
        .expect(403);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without authentication", async () => {
      const user = await createTestUser();
      const task = await createTestTask(user._id);

      await request(app)
        .patch(`/v1/tasks/${task._id}`)
        .send({ title: "Updated" })
        .expect(401);
    });
  });

  describe("PATCH /v1/tasks/:id/toggle", () => {
    it("should toggle task status from PENDING to COMPLETED", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);
      const task = await createTestTask(user._id, {
        status: TaskStatus.PENDING,
      });

      const response = await request(app)
        .patch(`/v1/tasks/${task._id}/toggle`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.task.status).toBe(TaskStatus.COMPLETED);
    });

    it("should toggle task status from COMPLETED to PENDING", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);
      const task = await createTestTask(user._id, {
        status: TaskStatus.COMPLETED,
      });

      const response = await request(app)
        .patch(`/v1/tasks/${task._id}/toggle`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.task.status).toBe(TaskStatus.PENDING);
    });

    it("should fail without authentication", async () => {
      const user = await createTestUser();
      const task = await createTestTask(user._id);

      await request(app).patch(`/v1/tasks/${task._id}/toggle`).expect(401);
    });
  });

  describe("DELETE /v1/tasks/:id", () => {
    it("should delete task as admin", async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser();
      const token = generateTestAccessToken(admin._id, admin.role);
      const task = await createTestTask(user._id);

      const response = await request(app)
        .delete(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.message).toContain("deleted");
    });

    it("should fail to delete task as regular user", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);
      const task = await createTestTask(user._id);

      const response = await request(app)
        .delete(`/v1/tasks/${task._id}`)
        .set(getAuthHeader(token))
        .expect(403);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toContain("admin");
    });

    it("should fail without authentication", async () => {
      const user = await createTestUser();
      const task = await createTestTask(user._id);

      await request(app).delete(`/v1/tasks/${task._id}`).expect(401);
    });
  });
});
