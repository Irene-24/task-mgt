"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTaskByIdQuery, useUpdateTaskMutation } from "@/services/task";
import { TaskStatus } from "@/types/task.types";
import { CaseRender } from "@/shared/case-render";
import ErrorState from "@/shared/quick-error";
import { Skeleton } from "@/ui/skeleton";
import { getAPIErrMessage } from "@/helpers/errorHelpers";
import { Button } from "@/ui/button";
import { TASK_STATUS_DETAILS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FORM_STYLES } from "@/lib/app-styles";

interface UpdateTaskStatusProps {
  taskId: string;
  open: boolean;
  onClose: () => void;
}

const UpdateTaskStatus = ({ taskId, open, onClose }: UpdateTaskStatusProps) => {
  const { data, isLoading, isError, error, isSuccess } = useGetTaskByIdQuery(
    taskId,
    {
      skip: !open || !taskId,
    }
  );
  const [update, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [status, setStatus] = useState<TaskStatus | "">("");

  React.useEffect(() => {
    if (data?.task) {
      setStatus(data.task.status);
    }
  }, [data]);

  const handleUpdate = async () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    toast.dismiss();
    toast.loading("Updating task status...");

    try {
      await update({
        id: taskId,
        data: { status },
      }).unwrap();

      toast.dismiss();
      toast.success("Task status updated successfully");
      onClose();
    } catch (err) {
      toast.dismiss();
      toast.error(getAPIErrMessage({ error: err }, "Failed to update status"));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Task Status</AlertDialogTitle>
          <AlertDialogDescription>
            Change the status of this task.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <CaseRender show={isLoading}>
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CaseRender>

        <CaseRender show={isError}>
          <ErrorState
            message={getAPIErrMessage({ error }, "Failed to load task")}
          />
        </CaseRender>

        <CaseRender show={isSuccess && !!data}>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <label
                htmlFor="status"
                className={cn(FORM_STYLES.auth_label, "mb-2 font-semibold ")}
              >
                Task Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
              >
                <SelectTrigger
                  id="status"
                  className={cn(FORM_STYLES.auth_input, "w-full")}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TASK_STATUS_DETAILS.map((statusOption) => (
                      <SelectItem
                        key={statusOption.value}
                        value={statusOption.value}
                      >
                        {statusOption.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Title:</strong> {data?.task?.title}
              </p>
              <div className="text-sm text-muted-foreground">
                <p>
                  {" "}
                  <strong>Description: </strong>
                </p>
                <p>{data?.task?.description}</p>
              </div>
            </div>
          </div>
        </CaseRender>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || isLoading || !status}
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateTaskStatus;
