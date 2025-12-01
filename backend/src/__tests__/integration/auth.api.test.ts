import request from "supertest";
import { Application } from "express";
import { createTestApp } from "../utils/testApp";
import { createTestUser, cleanDatabase } from "../utils/testHelpers";
import { validUserData } from "../utils/fixtures";
import { UserRole } from "@/utils/constants";

describe("Auth API Integration Tests", () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe("POST /v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user).toMatchObject({
        email: validUserData.email,
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        role: UserRole.USER,
      });
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail to register with invalid email", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({ ...validUserData, email: "invalid-email" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail to register with weak password", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({ ...validUserData, password: "weak" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail to register with duplicate email", async () => {
      await createTestUser(validUserData);

      const response = await request(app)
        .post("/v1/auth/register")
        .send(validUserData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toContain("email");
    });

    it("should fail without required fields", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("POST /v1/auth/signin", () => {
    beforeEach(async () => {
      await createTestUser(validUserData);
    });

    it("should sign in with valid credentials", async () => {
      const response = await request(app)
        .post("/v1/auth/signin")
        .send({
          email: validUserData.email,
          password: validUserData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user).toHaveProperty("email", validUserData.email);
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app)
        .post("/v1/auth/signin")
        .send({
          email: validUserData.email,
          password: "WrongPassword@123",
        })
        .expect(401);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toContain("Invalid");
    });

    it("should fail with non-existent email", async () => {
      const response = await request(app)
        .post("/v1/auth/signin")
        .send({
          email: "nonexistent@example.com",
          password: validUserData.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app)
        .post("/v1/auth/signin")
        .send({
          email: "invalid-email",
          password: validUserData.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without credentials", async () => {
      const response = await request(app)
        .post("/v1/auth/signin")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("POST /v1/auth/refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      // First register to get tokens
      const registerResponse = await request(app)
        .post("/v1/auth/register")
        .send(validUserData);

      const { refreshToken } = registerResponse.body;

      // Use refresh token to get new tokens
      const response = await request(app)
        .post("/v1/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty("userId");
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.refreshToken).not.toBe(refreshToken); // Should be a new token
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/v1/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without refresh token", async () => {
      const response = await request(app)
        .post("/v1/auth/refresh")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("POST /v1/auth/logout", () => {
    it("should logout successfully with valid refresh token", async () => {
      // First register to get tokens
      const registerResponse = await request(app)
        .post("/v1/auth/register")
        .send(validUserData);

      const { refreshToken } = registerResponse.body;

      // Logout
      const response = await request(app)
        .post("/v1/auth/logout")
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("successfully");
    });

    it("should fail to use refresh token after logout", async () => {
      // Register and get tokens
      const registerResponse = await request(app)
        .post("/v1/auth/register")
        .send(validUserData);

      const { refreshToken } = registerResponse.body;

      // Logout
      await request(app)
        .post("/v1/auth/logout")
        .send({ refreshToken })
        .expect(200);

      // Try to use the same refresh token
      const response = await request(app)
        .post("/v1/auth/refresh")
        .send({ refreshToken })
        .expect(401);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail without refresh token", async () => {
      const response = await request(app)
        .post("/v1/auth/logout")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });
});
