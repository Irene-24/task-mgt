import { Types } from "mongoose";
import {
  isTaskCreator,
  isTaskAssignee,
  hasTaskAccess,
} from "@/utils/taskAccess";

describe("Task Access Utilities", () => {
  const userId = new Types.ObjectId();
  const otherUserId = new Types.ObjectId();

  describe("isTaskCreator", () => {
    it("should return true when user is the creator (unpopulated ObjectId)", () => {
      const result = isTaskCreator(userId, userId);
      expect(result).toBe(true);
    });

    it("should return true when user is the creator (populated object)", () => {
      const populatedCreator = { _id: userId };
      const result = isTaskCreator(populatedCreator, userId);
      expect(result).toBe(true);
    });

    it("should return false when user is not the creator", () => {
      const result = isTaskCreator(otherUserId, userId);
      expect(result).toBe(false);
    });

    it("should handle string userId comparison", () => {
      const result = isTaskCreator(userId, userId.toString());
      expect(result).toBe(true);
    });

    it("should return false when comparing different users", () => {
      const populatedCreator = { _id: otherUserId };
      const result = isTaskCreator(populatedCreator, userId.toString());
      expect(result).toBe(false);
    });
  });

  describe("isTaskAssignee", () => {
    it("should return true when user is assigned (unpopulated ObjectId)", () => {
      const result = isTaskAssignee(userId, userId);
      expect(result).toBe(true);
    });

    it("should return true when user is assigned (populated object)", () => {
      const populatedAssignee = { _id: userId };
      const result = isTaskAssignee(populatedAssignee, userId);
      expect(result).toBe(true);
    });

    it("should return false when user is not assigned", () => {
      const result = isTaskAssignee(otherUserId, userId);
      expect(result).toBe(false);
    });

    it("should return false when assignedTo is null", () => {
      const result = isTaskAssignee(null, userId);
      expect(result).toBe(false);
    });

    it("should return false when assignedTo is undefined", () => {
      const result = isTaskAssignee(undefined, userId);
      expect(result).toBe(false);
    });

    it("should handle string userId comparison", () => {
      const result = isTaskAssignee(userId, userId.toString());
      expect(result).toBe(true);
    });

    it("should return false when comparing different users", () => {
      const populatedAssignee = { _id: otherUserId };
      const result = isTaskAssignee(populatedAssignee, userId.toString());
      expect(result).toBe(false);
    });
  });

  describe("hasTaskAccess", () => {
    it("should return true when user is the creator", () => {
      const result = hasTaskAccess(userId, null, userId);
      expect(result).toBe(true);
    });

    it("should return true when user is the assignee", () => {
      const result = hasTaskAccess(otherUserId, userId, userId);
      expect(result).toBe(true);
    });

    it("should return true when user is both creator and assignee", () => {
      const result = hasTaskAccess(userId, userId, userId);
      expect(result).toBe(true);
    });

    it("should return false when user is neither creator nor assignee", () => {
      const thirdUserId = new Types.ObjectId();
      const result = hasTaskAccess(userId, otherUserId, thirdUserId);
      expect(result).toBe(false);
    });

    it("should work with populated creator", () => {
      const populatedCreator = { _id: userId };
      const result = hasTaskAccess(populatedCreator, null, userId);
      expect(result).toBe(true);
    });

    it("should work with populated assignee", () => {
      const populatedAssignee = { _id: userId };
      const result = hasTaskAccess(otherUserId, populatedAssignee, userId);
      expect(result).toBe(true);
    });

    it("should work with both populated", () => {
      const populatedCreator = { _id: otherUserId };
      const populatedAssignee = { _id: userId };
      const result = hasTaskAccess(populatedCreator, populatedAssignee, userId);
      expect(result).toBe(true);
    });

    it("should handle string userId", () => {
      const result = hasTaskAccess(userId, null, userId.toString());
      expect(result).toBe(true);
    });

    it("should return false when no access with populated fields", () => {
      const populatedCreator = { _id: otherUserId };
      const populatedAssignee = { _id: otherUserId };
      const thirdUserId = new Types.ObjectId();
      const result = hasTaskAccess(
        populatedCreator,
        populatedAssignee,
        thirdUserId
      );
      expect(result).toBe(false);
    });
  });
});
