import { Types } from "mongoose";

/**
 * Check if a user is the creator of a task
 * @param taskCreatorId - The task's createdBy field
 * @param userId - The user ID to check against
 * @returns true if the user is the creator
 */
export const isTaskCreator = (
  taskCreatorId: Types.ObjectId | { _id: Types.ObjectId },
  userId: Types.ObjectId | string
): boolean => {
  const creatorId =
    taskCreatorId instanceof Types.ObjectId ? taskCreatorId : taskCreatorId._id;
  return creatorId.toString() === userId.toString();
};

/**
 * Check if a user is assigned to a task
 * @param taskAssignedToId - The task's assignedTo field
 * @param userId - The user ID to check against
 * @returns true if the user is assigned to the task
 */
export const isTaskAssignee = (
  taskAssignedToId: Types.ObjectId | { _id: Types.ObjectId } | null | undefined,
  userId: Types.ObjectId | string
): boolean => {
  if (!taskAssignedToId) return false;
  const assigneeId =
    taskAssignedToId instanceof Types.ObjectId
      ? taskAssignedToId
      : taskAssignedToId._id;
  return assigneeId?.toString() === userId.toString();
};

/**
 * Check if a user has access to a task (is creator or assignee)
 * @param taskCreatorId - The task's createdBy field
 * @param taskAssignedToId - The task's assignedTo field
 * @param userId - The user ID to check against
 * @returns true if the user is the creator or assignee
 */
export const hasTaskAccess = (
  taskCreatorId: Types.ObjectId | { _id: Types.ObjectId },
  taskAssignedToId: Types.ObjectId | { _id: Types.ObjectId } | null | undefined,
  userId: Types.ObjectId | string
): boolean => {
  return (
    isTaskCreator(taskCreatorId, userId) ||
    isTaskAssignee(taskAssignedToId, userId)
  );
};
