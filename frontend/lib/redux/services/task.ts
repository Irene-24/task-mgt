import { MAX_PAGE_SIZE } from "@/lib/constants";
import { baseApi } from "./base";
import {
  GetTasksParams,
  GetTasksResponse,
  GetTaskStatsResponse,
  GetTaskByIdResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  ToggleTaskStatusResponse,
  DeleteTaskResponse,
} from "@/types/task.types";

// Helper to update all getTasks query caches
const updateAllTasksCaches = (
  dispatch: any,
  getState: any,
  taskApiUtil: any,
  updateFn: (draft: any, parsedArg: any) => void
) => {
  const state = getState();
  const queries = state.api.queries;

  for (const [key, value] of Object.entries(queries)) {
    if (key.startsWith("getTasks(") && (value as any)?.data) {
      const regex = /getTasks\((.*)\)/;
      const match = regex.exec(key);
      const queryKey = match?.[1];
      let parsedArg;
      try {
        parsedArg = queryKey ? JSON.parse(queryKey) : undefined;
      } catch {
        parsedArg = undefined;
      }

      dispatch(
        taskApiUtil.updateQueryData("getTasks", parsedArg, (draft: any) => {
          updateFn(draft, parsedArg);
        })
      );
    }
  }
};

const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Infinite query for getting tasks with pagination
    getTasks: build.infiniteQuery<
      GetTasksResponse,
      GetTasksParams,
      string | null
    >({
      query: ({ queryArg, pageParam }) => ({
        url: "/tasks",
        params: {
          ...queryArg,
          //@ts-expect-error type issues
          status: queryArg.status === "all" ? undefined : queryArg.status,
          limit: queryArg.limit ?? MAX_PAGE_SIZE,
          cursor: pageParam,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
          // Use the nextCursor from the response
          return lastPage.hasMore ? lastPage.nextCursor : undefined;
        },
      },
      providesTags: (result) =>
        result
          ? [
              ...result.pages
                .flatMap((page) => page.tasks)
                .map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    // Get task statistics
    getTaskStats: build.query<GetTaskStatsResponse, void>({
      query: () => "/tasks/stats",
      providesTags: [{ type: "Task", id: "STATS" }],
    }),

    // Get single task by ID
    getTaskById: build.query<GetTaskByIdResponse, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),

    // Create new task
    createTask: build.mutation<CreateTaskResponse, CreateTaskRequest>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Task", id: "LIST" },
        { type: "Task", id: "STATS" },
      ],
    }),

    // Update task
    updateTask: build.mutation<
      UpdateTaskResponse,
      { id: string; data: UpdateTaskRequest }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: response } = await queryFulfilled;
          const updatedTask = response.task;

          // Update all getTasks query caches
          updateAllTasksCaches(dispatch, getState, taskApi.util, (draft) => {
            for (const page of draft.pages) {
              const taskIndex = page.tasks.findIndex((t: any) => t.id === id);
              if (taskIndex !== -1) {
                page.tasks[taskIndex] = updatedTask;
                break;
              }
            }
          });

          // Update the single task cache if it exists
          dispatch(
            taskApi.util.updateQueryData("getTaskById", id, (draft) => {
              draft.task = updatedTask;
            })
          );

          // Invalidate stats to refetch them
          dispatch(
            taskApi.util.invalidateTags([{ type: "Task", id: "STATS" }])
          );
        } catch (err) {
          // Error handling - cache will revert automatically
          console.error("Error updating task:", err);
        }
      },
    }),

    // Toggle task status
    toggleTaskStatus: build.mutation<ToggleTaskStatusResponse, string>({
      query: (id) => ({
        url: `/tasks/${id}/toggle`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: response } = await queryFulfilled;
          const updatedTask = response.task;

          // Update all getTasks query caches
          updateAllTasksCaches(dispatch, getState, taskApi.util, (draft) => {
            for (const page of draft.pages) {
              const taskIndex = page.tasks.findIndex((t: any) => t.id === id);
              if (taskIndex !== -1) {
                page.tasks[taskIndex] = updatedTask;
                break;
              }
            }
          });

          // Update the single task cache
          dispatch(
            taskApi.util.updateQueryData("getTaskById", id, (draft) => {
              draft.task = updatedTask;
            })
          );

          // Invalidate stats
          dispatch(
            taskApi.util.invalidateTags([{ type: "Task", id: "STATS" }])
          );
        } catch (err) {
          console.error("Error toggling task status:", err);
        }
      },
    }),

    // Delete task (Admin only)
    deleteTask: build.mutation<DeleteTaskResponse, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          // Update all getTasks query caches
          updateAllTasksCaches(dispatch, getState, taskApi.util, (draft) => {
            for (const page of draft.pages) {
              const taskIndex = page.tasks.findIndex((t: any) => t.id === id);
              if (taskIndex !== -1) {
                page.tasks.splice(taskIndex, 1);
                break;
              }
            }
          });

          // Invalidate stats and single task cache
          dispatch(
            taskApi.util.invalidateTags([
              { type: "Task", id },
              { type: "Task", id: "STATS" },
            ])
          );
        } catch (err) {
          console.error("Error deleting task:", err);
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTasksInfiniteQuery,
  useGetTaskStatsQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useToggleTaskStatusMutation,
  useDeleteTaskMutation,
} = taskApi;

export { taskApi };
