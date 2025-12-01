"use client";

import TaskFilters from "@/components/Dashboard/Tasks/TaskFilters";
import React, { useState, useEffect } from "react";
import { useGetTasksInfiniteQuery } from "@/services/task";
import { GetTasksParams } from "@/types/task.types";
import { MAX_PAGE_SIZE } from "@/lib/constants";
import { CaseRender } from "@/shared/case-render";
import ErrorState from "@/shared/quick-error";
import { getAPIErrMessage } from "@/helpers/errorHelpers";
import TaskList from "@/components/Dashboard/Tasks/TaskList";

type FilterParams = Omit<GetTasksParams, "cursor">;

const defaultFilters: FilterParams = {
  limit: MAX_PAGE_SIZE,
  sortBy: "createdAt",
  sortOrder: "desc",
  //@ts-expect-error type issues
  status: "all",
  search: "",
};

const Dashboard = () => {
  const [filters, setFilters] = useState<FilterParams>(defaultFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<FilterParams>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Debounce filter changes (especially for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters]);

  const {
    currentData: data,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isSuccess,
    error,
    isError,
    isFetching,
  } = useGetTasksInfiniteQuery(debouncedFilters);

  // Flatten tasks from all pages
  const allTasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  // Access hasMore from the last page
  const lastPage = data?.pages[data.pages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="p-2">
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        refetch={refetch}
      />

      <CaseRender show={isLoading}>
        <div className="animate-pulse text-center p-2">Loading tasks...</div>
      </CaseRender>

      <CaseRender show={isSuccess}>
        <TaskList
          tasks={allTasks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isFetching={isFetching}
        />

        <CaseRender show={hasMore}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 fixed bottom-2 left-1/2 -translate-x-1/2 z-10"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </CaseRender>
      </CaseRender>

      <CaseRender show={isError}>
        <ErrorState
          message={getAPIErrMessage({ error }, "Unable to load tasks")}
          onRetry={refetch}
          variant="card"
        />
      </CaseRender>
    </div>
  );
};

export default Dashboard;
