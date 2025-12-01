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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCreateTaskMutation } from "@/services/task";
import { Button } from "@/components/ui/button";
import { CreateTaskRequest } from "@/types/task.types";

const CreateTask = () => {
  const [create, { isLoading }] = useCreateTaskMutation();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleCreate = async (data: any) => {
    const body: CreateTaskRequest = {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      status: data.status,
    };
    await create(body).unwrap();

    cancelRef.current?.click();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>+ Add Task</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Task</AlertDialogTitle>
          <AlertDialogDescription>
            Fill in the details below to create a new task.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <TaskForm isLoading={isLoading} onSubmitForm={handleCreate} />
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateTask;
