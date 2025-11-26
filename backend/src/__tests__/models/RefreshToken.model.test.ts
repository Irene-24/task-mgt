import RefreshToken from "@/models/RefreshToken.model";
import { createTestUser, generateTestRefreshToken } from "../utils/testHelpers";
import jwt from "jsonwebtoken";
import { appConfig } from "@/config/appConfig";

function isTokenRevoked(t: any) {
  return t.isRevoked;
}

describe("RefreshToken Model", () => {
  let userId: any;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id;
  });

  describe("Schema Validation", () => {
    it("should create a refresh token with valid data", async () => {
      const token = generateTestRefreshToken(userId);
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      const refreshToken = await RefreshToken.create({
        token,
        userId,
        expiresAt: new Date(decoded.exp! * 1000),
      });

      expect(refreshToken.token).toBe(token);
      expect(refreshToken.userId.toString()).toBe(userId.toString());
      expect(refreshToken.isRevoked).toBe(false);
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
    });

    it("should fail without required fields", async () => {
      await expect(RefreshToken.create({})).rejects.toThrow();
    });

    it("should default isRevoked to false", async () => {
      const token = generateTestRefreshToken(userId);
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      const refreshToken = await RefreshToken.create({
        token,
        userId,
        expiresAt: new Date(decoded.exp! * 1000),
      });

      expect(refreshToken.isRevoked).toBe(false);
    });
  });

  describe("Static Methods", () => {
    describe("revokeToken", () => {
      it("should revoke a token by token string", async () => {
        const token = generateTestRefreshToken(userId);
        const decoded = jwt.decode(token) as jwt.JwtPayload;

        await RefreshToken.create({
          token,
          userId,
          expiresAt: new Date(decoded.exp! * 1000),
        });

        await RefreshToken.revokeToken(token);

        const revokedToken = await RefreshToken.findOne({ token });
        expect(revokedToken?.isRevoked).toBe(true);
      });
    });

    describe("revokeAllUserTokens", () => {
      it("should revoke all tokens for a user", async () => {
        const token1 = generateTestRefreshToken(userId);
        const token2 = generateTestRefreshToken(userId);
        const decoded1 = jwt.decode(token1) as jwt.JwtPayload;
        const decoded2 = jwt.decode(token2) as jwt.JwtPayload;

        await RefreshToken.create({
          token: token1,
          userId,
          expiresAt: new Date(decoded1.exp! * 1000),
        });

        await RefreshToken.create({
          token: token2,
          userId,
          expiresAt: new Date(decoded2.exp! * 1000),
        });

        await RefreshToken.revokeAllUserTokens(userId);

        const tokens = await RefreshToken.find({ userId });
        const allRevoked = tokens.every(isTokenRevoked);
        expect(allRevoked).toBe(true);
      });

      it("should not affect other users tokens", async () => {
        const otherUser = await createTestUser({ email: "other@example.com" });
        const token1 = generateTestRefreshToken(userId);
        const token2 = generateTestRefreshToken(otherUser._id);
        const decoded1 = jwt.decode(token1) as jwt.JwtPayload;
        const decoded2 = jwt.decode(token2) as jwt.JwtPayload;

        await RefreshToken.create({
          token: token1,
          userId,
          expiresAt: new Date(decoded1.exp! * 1000),
        });

        await RefreshToken.create({
          token: token2,
          userId: otherUser._id,
          expiresAt: new Date(decoded2.exp! * 1000),
        });

        await RefreshToken.revokeAllUserTokens(userId);

        const otherUserToken = await RefreshToken.findOne({
          userId: otherUser._id,
        });
        expect(otherUserToken?.isRevoked).toBe(false);
      });
    });

    describe("isValidToken", () => {
      it("should return true for valid non-revoked token", async () => {
        const token = generateTestRefreshToken(userId);
        const decoded = jwt.decode(token) as jwt.JwtPayload;

        await RefreshToken.create({
          token,
          userId,
          expiresAt: new Date(decoded.exp! * 1000),
        });

        const isValid = await RefreshToken.isValidToken(token);
        expect(isValid).toBe(true);
      });

      it("should return false for revoked token", async () => {
        const token = generateTestRefreshToken(userId);
        const decoded = jwt.decode(token) as jwt.JwtPayload;

        await RefreshToken.create({
          token,
          userId,
          expiresAt: new Date(decoded.exp! * 1000),
          isRevoked: true,
        });

        const isValid = await RefreshToken.isValidToken(token);
        expect(isValid).toBe(false);
      });

      it("should return false for non-existent token", async () => {
        const token = generateTestRefreshToken(userId);
        const isValid = await RefreshToken.isValidToken(token);
        expect(isValid).toBe(false);
      });

      it("should return false for expired token", async () => {
        const expiredToken = jwt.sign(
          { userId: userId.toString() },
          appConfig.jwtRefreshSecret as jwt.Secret,
          { expiresIn: "0s" } as any
        );

        await RefreshToken.create({
          token: expiredToken,
          userId,
          expiresAt: new Date(Date.now() - 1000),
        });

        const isValid = await RefreshToken.isValidToken(expiredToken);
        expect(isValid).toBe(false);
      });
    });

    describe("cleanupExpiredTokens", () => {
      it("should delete expired tokens", async () => {
        const expiredToken = jwt.sign(
          { userId: userId.toString() },
          appConfig.jwtRefreshSecret as jwt.Secret,
          { expiresIn: "0s" } as any
        );

        await RefreshToken.create({
          token: expiredToken,
          userId,
          expiresAt: new Date(Date.now() - 1000),
        });

        const result = await RefreshToken.cleanupExpiredTokens();
        expect(result.deletedCount).toBeGreaterThan(0);

        const token = await RefreshToken.findOne({ token: expiredToken });
        expect(token).toBeNull();
      });

      it("should not delete valid tokens", async () => {
        const validToken = generateTestRefreshToken(userId);
        const decoded = jwt.decode(validToken) as jwt.JwtPayload;

        await RefreshToken.create({
          token: validToken,
          userId,
          expiresAt: new Date(decoded.exp! * 1000),
        });

        await RefreshToken.cleanupExpiredTokens();

        const token = await RefreshToken.findOne({ token: validToken });
        expect(token).not.toBeNull();
      });
    });
  });

  describe("Indexes", () => {
    it("should have index on userId", async () => {
      const indexes = await RefreshToken.collection.getIndexes();
      expect(indexes).toHaveProperty("userId_1");
    });

    it("should have index on expiresAt", async () => {
      const indexes = await RefreshToken.collection.getIndexes();
      expect(indexes).toHaveProperty("expiresAt_1");
    });
  });
});
