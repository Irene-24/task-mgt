import request from "supertest";
import { Application } from "express";
import { createTestApp } from "../utils/testApp";
import {
  createTestUser,
  createTestAdmin,
  generateTestAccessToken,
  cleanDatabase,
  getAuthHeader,
} from "../utils/testHelpers";
import { UserRole } from "@/utils/constants";

describe("User API Integration Tests", () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe("GET /v1/users/me", () => {
    it("should get current user profile", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .get("/v1/users/me")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.user).toMatchObject({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/v1/users/me").expect(401);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/v1/users/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("GET /v1/users", () => {
    it("should get all users as admin", async () => {
      const admin = await createTestAdmin();
      await createTestUser({ email: "user1@example.com" });
      await createTestUser({ email: "user2@example.com" });
      const token = generateTestAccessToken(admin._id, admin.role);

      const response = await request(app)
        .get("/v1/users")
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.users).toHaveLength(3); // admin + 2 users
      expect(response.body.users[0]).toHaveProperty("email");
      expect(response.body.users[0]).toHaveProperty("firstName");
      expect(response.body.users[0]).not.toHaveProperty("password");
    });

    it("should fail as regular user", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .get("/v1/users")
        .set(getAuthHeader(token))
        .expect(403);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toContain("admin");
    });

    it("should fail without authentication", async () => {
      await request(app).get("/v1/users").expect(401);
    });
  });

  describe("GET /v1/users/:id", () => {
    it("should get user by id", async () => {
      const user = await createTestUser();
      const targetUser = await createTestUser({ email: "target@example.com" });
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .get(`/v1/users/${targetUser._id}`)
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.user).toMatchObject({
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
      });
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail with non-existent user id", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

      const response = await request(app)
        .get(`/v1/users/${fakeId}`)
        .set(getAuthHeader(token))
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without authentication", async () => {
      const user = await createTestUser();
      await request(app).get(`/v1/users/${user._id}`).expect(401);
    });
  });

  describe("PATCH /v1/users/:id/role", () => {
    it("should update user role as admin", async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser();
      const token = generateTestAccessToken(admin._id, admin.role);

      const response = await request(app)
        .patch(`/v1/users/${user._id}/role`)
        .set(getAuthHeader(token))
        .send({ role: UserRole.ADMIN })
        .expect(200);

      expect(response.body.user.role).toBe(UserRole.ADMIN);
      expect(response.body.user.email).toBe(user.email);
    });

    it("should allow users to update their own role", async () => {
      const user = await createTestUser();
      const token = generateTestAccessToken(user._id, user.role);

      const response = await request(app)
        .patch(`/v1/users/${user._id}/role`)
        .set(getAuthHeader(token))
        .send({ role: UserRole.ADMIN })
        .expect(200);

      expect(response.body.user.role).toBe(UserRole.ADMIN);
    });

    it("should fail with invalid role", async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser();
      const token = generateTestAccessToken(admin._id, admin.role);

      const response = await request(app)
        .patch(`/v1/users/${user._id}/role`)
        .set(getAuthHeader(token))
        .send({ role: "INVALID_ROLE" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without authentication", async () => {
      const user = await createTestUser();
      await request(app)
        .patch(`/v1/users/${user._id}/role`)
        .send({ role: UserRole.ADMIN })
        .expect(401);
    });
  });
});
