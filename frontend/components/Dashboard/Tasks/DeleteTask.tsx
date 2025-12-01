"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTaskMutation } from "@/services/task";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAPIErrMessage } from "@/helpers/errorHelpers";

interface Props {
  taskId: string;
  open: boolean;
  onClose: () => void;
}

const DeleteTask = ({ taskId, open, onClose }: Props) => {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    try {
      toast.dismiss();
      toast.loading("Deleting task...");
      await deleteTask(taskId).unwrap();

      toast.dismiss();
      toast.success("Task deleted successfully.");
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(getAPIErrMessage({ error }, "Failed to delete task."));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTask;
