import User from "@/models/User.model";
import { UserRole } from "@/utils/constants";
import { validUserData } from "../utils/fixtures";

describe("User Model", () => {
  describe("Schema Validation", () => {
    it("should create a user with valid data", async () => {
      const createdUser = await User.create(validUserData);
      const user = await User.findById(createdUser._id).select("+password");

      expect(user!.email).toBe(validUserData.email);
      expect(user!.firstName).toBe(validUserData.firstName);
      expect(user!.lastName).toBe(validUserData.lastName);
      expect(user!.role).toBe(UserRole.USER);
      expect(user!.isActive).toBe(true);
      expect(user!.password).not.toBe(validUserData.password); // Should be hashed
    });

    it("should hash password before saving", async () => {
      const createdUser = await User.create(validUserData);
      const user = await User.findById(createdUser._id).select("+password");
      expect(user!.password).not.toBe(validUserData.password);
      expect(user!.password.length).toBeGreaterThan(20); // Bcrypt hash
    });

    it("should fail without required fields", async () => {
      await expect(User.create({})).rejects.toThrow();
    });

    it("should fail with invalid email", async () => {
      const invalidUser = { ...validUserData, email: "invalid-email" };
      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it("should fail with duplicate email", async () => {
      await User.create(validUserData);
      await expect(
        User.create({ ...validUserData, firstName: "Different" })
      ).rejects.toThrow(/duplicate/i);
    });

    it("should default role to USER", async () => {
      const userData = { ...validUserData, email: "newuser@example.com" };
      delete (userData as any).role;
      const user = await User.create(userData);
      expect(user.role).toBe(UserRole.USER);
    });

    it("should default isActive to true", async () => {
      const user = await User.create({
        ...validUserData,
        email: "active@example.com",
      });
      expect(user.isActive).toBe(true);
    });
  });

  describe("Virtual Properties", () => {
    it("should compute fullName virtual", async () => {
      const user = await User.create(validUserData);
      expect((user as any).fullName).toBe(
        `${validUserData.firstName} ${validUserData.lastName}`
      );
    });
  });

  describe("Instance Methods", () => {
    it("should exclude password and __v in JSON", async () => {
      const user = await User.create(validUserData);
      const json = user.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.__v).toBeUndefined();
      expect(json.email).toBe(validUserData.email);
    });
  });

  describe("Indexes", () => {
    it("should have email index", async () => {
      const indexes = await User.collection.getIndexes();
      expect(indexes).toHaveProperty("email_1");
    });

    it("should have createdAt index", async () => {
      const indexes = await User.collection.getIndexes();
      expect(indexes).toHaveProperty("createdAt_-1");
    });
  });

  describe("Timestamps", () => {
    it("should add createdAt and updatedAt timestamps", async () => {
      const user = await User.create(validUserData);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt on modification", async () => {
      const user = await User.create(validUserData);
      const originalUpdatedAt = user.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      user.firstName = "Updated";
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });
});
