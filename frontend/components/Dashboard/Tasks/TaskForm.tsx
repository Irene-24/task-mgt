"use client";

import { Task, TaskStatus } from "@/types/task.types";
import React, { useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { FORM_STYLES } from "@/lib/app-styles";
import orderBy from "lodash/orderBy";

import { isValid } from "date-fns/isValid";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TASK_STATUS_LIST, TASK_STATUS_DETAILS } from "@/lib/constants";
import { toast } from "sonner";
import { getAPIErrMessage } from "@/helpers/errorHelpers";
import { DateTimePicker } from "@/shared/custom-dt-picker";
import { Textarea } from "@/ui/textarea";
import { useGetAllUsersQuery } from "@/services/user";
import useLoggedInUser from "@/hooks/useLoggedInUser";
import { CaseRender } from "@/shared/case-render";
import ErrorState from "@/shared/quick-error";
import Combobox from "@/ui/combobox";

const schema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  status: z.enum(TASK_STATUS_LIST).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(), // ISO date string
});

type SchemaType = z.infer<typeof schema>;

const defaultValues: SchemaType = {
  title: "",
  description: "",
  status: TaskStatus.PENDING,
  assignedTo: undefined,
  dueDate: undefined,
};

interface Props {
  isLoading: boolean;
  task?: Task;
  onSubmitForm: (data: SchemaType) => Promise<void>;
}

const TaskForm = ({ isLoading, task, onSubmitForm }: Props) => {
  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { isAdmin, user } = useLoggedInUser();

  const {
    data = { count: 0, users: [] },
    isFetching,
    refetch,
    isError,
    isSuccess,
    error,
  } = useGetAllUsersQuery(undefined, { skip: !isAdmin });

  const handleSubmit = async (values: SchemaType) => {
    toast.dismiss();
    toast.loading(task?.id ? "Updating task..." : "Creating task...");
    try {
      await onSubmitForm(values);
      toast.dismiss();
      toast.success(
        task?.id ? "Task updated successfully." : "Task created successfully."
      );

      form.reset(defaultValues);
    } catch (error) {
      const defaultMsg = task?.id
        ? "Failed to update task."
        : "Failed to create task.";
      toast.dismiss();

      const msg = getAPIErrMessage({ error }, defaultMsg);
      toast.error(msg);
    }
  };

  const userList = useMemo(() => {
    if (!data.users || !user) return [];

    const mappedUsers = data.users.map((u) => {
      if (u.id === user.id) {
        return { ...u, fullName: `${u.fullName} (Me)` };
      }
      return u;
    });

    // Separate current user from others
    const currentUser = mappedUsers.find((u) => u.id === user.id);
    const otherUsers = mappedUsers.filter((u) => u.id !== user.id);

    // Sort other users by firstName ascending, breaking ties with lastName and id
    const sortedOthers = orderBy(
      otherUsers,
      ["firstName", "lastName", "id"],
      ["asc"]
    );

    // Put current user first, then sorted others
    return currentUser ? [currentUser, ...sortedOthers] : sortedOthers;
  }, [user, data.users]);

  useEffect(() => {
    if (task?.id) {
      const resetData = {
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo?.id,
        dueDate: task.dueDate,
      };

      form.reset(resetData);
    }
  }, [task, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-4")}
      >
        <ScrollArea className="h-[55vh] ">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(FORM_STYLES.auth_label)}>
                    Task Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={cn(FORM_STYLES.auth_input)}
                      placeholder="Enter task title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className={cn(FORM_STYLES.auth_label)}>
                      Status
                    </FormLabel>

                    <Select {...field}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {TASK_STATUS_DETAILS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(FORM_STYLES.auth_label)}>
                    Due Date (Optional)
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      showIcon={false}
                      dateTimeFormat="do MMM, yyyy hh:mm aa"
                      className={cn(FORM_STYLES.auth_input, " w-full")}
                      showTime
                      onChange={(date) => {
                        if (date) {
                          form.setValue(field.name, date.toISOString(), {
                            shouldValidate: true,
                          });
                        } else {
                          form.setValue(field.name, undefined, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      value={
                        field.value && isValid(new Date(field.value))
                          ? new Date(field.value)
                          : undefined
                      }
                      calendarProps={{
                        modifiers: {
                          disabled: {
                            before: new Date(),
                          },

                          startMonth: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth()
                          ),
                        },
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(FORM_STYLES.auth_label)}>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className={cn(FORM_STYLES.auth_input, "min-h-[120px]")}
                      placeholder="Enter task description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CaseRender show={isAdmin}>
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className={`xl:col-span-2`}>
                    <CaseRender show={isSuccess && !isFetching}>
                      <FormLabel className={cn(FORM_STYLES.auth_label)}>
                        Assign To (Optional)
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          items={userList}
                          labelKey="fullName"
                          valueKey="id"
                          buttonClassName="font-normal"
                          onItemSelected={(item) => {
                            form.setValue(field.name, (item as any)?.id ?? "", {
                              shouldValidate: true,
                            });
                          }}
                          selectedValue={field.value}
                        />
                      </FormControl>

                      <FormMessage />
                    </CaseRender>
                    <CaseRender show={isFetching}>
                      <p className="animate-pulse">Loading users...</p>
                    </CaseRender>

                    <CaseRender show={isError && !isFetching}>
                      <ErrorState
                        onRetry={refetch}
                        variant="inline"
                        size="sm"
                        message={getAPIErrMessage(
                          { error },
                          "Unable to load users"
                        )}
                      />
                    </CaseRender>
                  </FormItem>
                )}
              />
            </CaseRender>
          </div>
        </ScrollArea>

        <div className="center">
          <Button
            size="lg"
            type="submit"
            disabled={isLoading}
            className={cn(FORM_STYLES.submitBtn, {
              "cursor-not-allowed animate-pulse": isLoading,
            })}
          >
            {task?.id ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
