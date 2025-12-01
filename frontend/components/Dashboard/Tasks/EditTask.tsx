"use client";

import React from "react";
import TaskForm from "./TaskForm";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetTaskByIdQuery, useUpdateTaskMutation } from "@/services/task";
import { UpdateTaskRequest } from "@/types/task.types";
import { CaseRender } from "@/shared/case-render";
import ErrorState from "@/shared/quick-error";
import { Skeleton } from "@/ui/skeleton";
import { getAPIErrMessage } from "@/helpers/errorHelpers";

interface EditTaskProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
}

const EditTask = ({ taskId, open, onClose }: EditTaskProps) => {
  const { data, isFetching, isError, error, isSuccess } = useGetTaskByIdQuery(
    taskId,
    {
      skip: !open || !taskId,
    }
  );
  const [update, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const handleUpdate = async (formData: any) => {
    const body: UpdateTaskRequest = {
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      status: formData.status,
    };
    await update({ id: taskId, data: body }).unwrap();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Task</AlertDialogTitle>
          <AlertDialogDescription>
            Update the task details below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <CaseRender show={isFetching}>
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CaseRender>

        <CaseRender show={isError && !isFetching}>
          <ErrorState
            message={getAPIErrMessage({ error }, "Failed to load task")}
          />
        </CaseRender>

        <CaseRender show={isSuccess && !isFetching}>
          <TaskForm
            isLoading={isUpdating}
            task={data?.task}
            onSubmitForm={handleUpdate}
          />
        </CaseRender>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditTask;
