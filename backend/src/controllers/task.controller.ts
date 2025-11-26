import { Request, Response } from "express";
import Task from "@/models/Task.model";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import { appConfig } from "@/config/appConfig";
import { TaskStatus } from "@/utils/constants";
import { hasTaskAccess } from "@/utils/taskAccess";

// Get task statistics for dashboard
export const getTaskStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;

    // Get counts for tasks user created or is assigned to
    const [total, pending, completed] = await Promise.all([
      Task.countDocuments({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      }),
      Task.countDocuments({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
        status: TaskStatus.PENDING,
      }),
      Task.countDocuments({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
        status: TaskStatus.COMPLETED,
      }),
    ]);

    res.status(200).json({
      stats: {
        total,
        pending,
        completed,
      },
    });
  }
);

// Get tasks with pagination, filtering, sorting, search
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const {
    cursor,
    limit = appConfig.maxPageSize,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    search,
  } = req.query;

  // Build query - only tasks user created or is assigned to
  const query: any = {
    $or: [{ createdBy: userId }, { assignedTo: userId }],
  };

  // Add status filter
  if (status) {
    query.status = status;
  }

  // Add partial text search using regex for better matching
  if (search) {
    const searchRegex = new RegExp(search as string, "i"); // Case-insensitive
    query.$or = [
      { createdBy: userId, title: searchRegex },
      { createdBy: userId, description: searchRegex },
      { assignedTo: userId, title: searchRegex },
      { assignedTo: userId, description: searchRegex },
    ];
  }

  // Add cursor-based pagination with _id for stable sorting
  if (cursor) {
    const cursorTask = await Task.findById(cursor);
    if (cursorTask) {
      // Use _id as cursor since it's unique and sortable
      if (sortOrder === "desc") {
        query._id = { $lt: cursor };
      } else {
        query._id = { $gt: cursor };
      }
    }
  }

  // Build sort object - always include _id for stable sorting
  const sortField = (sortBy as string) || "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortObj: any = {};
  sortObj[sortField] = sortDirection;
  sortObj._id = sortDirection; // Add _id as tiebreaker for stable pagination

  // Execute query with limit + 1 to check if there are more results
  const limitNum =
    typeof limit === "string" ? Number.parseInt(limit, 10) : Number(limit);

  const tasks = await Task.find(query)
    .populate("createdBy", "firstName lastName email fullName")
    .populate("assignedTo", "firstName lastName email fullName")
    .sort(sortObj)
    .limit(limitNum + 1);

  // Check if there are more results
  const hasMore = tasks.length > limitNum;
  const results = hasMore ? tasks.slice(0, limitNum) : tasks;

  // Get next cursor
  const nextCursor =
    hasMore && results.length > 0 ? results.at(-1)!._id.toString() : null;

  res.status(200).json({
    tasks: results,
    nextCursor,
    hasMore,
    limit: limitNum,
  });
});

// Get single task by ID
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(id).populate(
    "createdBy updatedBy assignedTo",
    "firstName lastName email"
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Check if user has access to this task
  if (!hasTaskAccess(task.createdBy, task.assignedTo, userId)) {
    throw new AppError(
      "Access denied. You can only view your own tasks or tasks assigned to you",
      403
    );
  }

  res.status(200).json({
    task,
  });
});

// Create new task
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, status, assignedTo } = req.body;
  const userId = req.user._id;

  const task = await Task.create({
    title,
    description,
    status: status || TaskStatus.PENDING,
    createdBy: userId,
    assignedTo: assignedTo || undefined,
  });

  res.status(201).json({
    task,
  });
});

// Update task
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, assignedTo } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Check if user has access to this task
  if (!hasTaskAccess(task.createdBy, task.assignedTo, userId)) {
    throw new AppError(
      "Access denied. You can only update your own tasks or tasks assigned to you",
      403
    );
  }

  // Update fields
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  task.updatedBy = userId;

  await task.save();
  await task.populate(
    "createdBy updatedBy assignedTo",
    "firstName lastName email"
  );

  res.status(200).json({
    task,
  });
});

// Delete task
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await task.deleteOne();

  res.status(200).json({
    message: "Task deleted successfully",
  });
});

// Toggle task status (pending <-> completed)
export const toggleTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user has access to this task
    if (!hasTaskAccess(task.createdBy, task.assignedTo, userId)) {
      throw new AppError(
        "Access denied. You can only update your own tasks or tasks assigned to you",
        403
      );
    }

    await task.toggleStatus();
    task.updatedBy = userId;
    await task.save();

    await task.populate("createdBy updatedBy", "firstName lastName email");

    res.status(200).json({
      task,
    });
  }
);
