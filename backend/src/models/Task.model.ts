import mongoose, { Schema, Document, Types } from "mongoose";
import { TASK_STATUS_LIST, TaskStatus } from "@/utils/constants";

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: Types.ObjectId; // Reference to User
  assignedTo?: Types.ObjectId; // Reference to User assigned
  updatedBy?: Types.ObjectId; // Reference to User who last updated
  createdAt: Date;
  updatedAt: Date;
  toggleStatus(): Promise<ITask>;
  markAsCompleted(userId?: Types.ObjectId): Promise<ITask>;
  markAsPending(userId?: Types.ObjectId): Promise<ITask>;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: TASK_STATUS_LIST,
      default: TaskStatus.PENDING,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        // Remove version key
        // Use a type assertion to avoid TypeScript 'delete' operand must be optional error
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ createdBy: 1, status: 1 }); // Compound index for filtering user's tasks by status
taskSchema.index({ assignedTo: 1 }); // Index for filtering tasks by assigned user

// Text index for search functionality on title and description
taskSchema.index({ title: "text", description: "text" });

// Virtual to check if task is completed
taskSchema.virtual("isCompleted").get(function (this: ITask) {
  return this.status === TaskStatus.COMPLETED;
});

// Instance method to toggle task status
taskSchema.methods.toggleStatus = function () {
  this.status =
    this.status === TaskStatus.COMPLETED
      ? TaskStatus.PENDING
      : TaskStatus.COMPLETED;
  return this.save();
};

// Instance method to mark as completed
taskSchema.methods.markAsCompleted = function (userId?: Types.ObjectId) {
  this.status = TaskStatus.COMPLETED;
  if (userId) {
    this.updatedBy = userId;
  }
  return this.save();
};

// Instance method to mark as pending
taskSchema.methods.markAsPending = function (userId?: Types.ObjectId) {
  this.status = TaskStatus.PENDING;
  if (userId) {
    this.updatedBy = userId;
  }
  return this.save();
};

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
