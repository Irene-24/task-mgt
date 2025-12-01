"use client";

import React, { useRef } from "react";
import TaskRow from "./TaskRow";
import TaskCard from "./TaskCard";
import { Task } from "@/types/task.types";
import { LayoutList, LayoutGrid } from "lucide-react";
import { Button } from "@/ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { CaseRender } from "@/shared/case-render";
import DeleteTask from "./DeleteTask";
import EditTask from "./EditTask";
import UpdateTaskStatus from "./UpdateTaskStatus";

interface Props {
  tasks: Task[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isFetching: boolean;
}

const TaskList = ({
  tasks = [],
  viewMode,
  onViewModeChange,
  isFetching,
}: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const [modalType, setModalType] = React.useState<
    "edit" | "delete" | "updateStatus" | null
  >(null);

  const updateViewMode = (mode: "grid" | "list") => () => {
    onViewModeChange(mode);
  };

  const onComplete = () => {
    setTaskId(null);
    setModalType(null);
  };

  const onSetTask =
    (type: "edit" | "delete" | "updateStatus") => (id: string) => {
      setTaskId(id);
      setModalType(type);
    };

  const ItemComponent = viewMode === "grid" ? TaskCard : TaskRow;

  // Setup virtualizer
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === "grid" ? 200 : 80), // Estimate item height
    overscan: 5, // Render 5 extra items above/below viewport
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  if (tasks.length === 0 && !isFetching) {
    return (
      <div className="center p-4 text-lg text-muted-foreground">
        <h3 className="text-center font-medium "> No tasks found.</h3>
      </div>
    );
  }

  return (
    <div className="">
      <div className="center p-2 gap-2">
        <span className="text-sm font-semibold text-foreground">
          View Mode:{" "}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={updateViewMode("list")}
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="flex-1"
          >
            <LayoutList className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            onClick={updateViewMode("grid")}
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            className="flex-1"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      <div
        ref={parentRef}
        className={cn(
          "h-screen lg:h-[calc(100vh-300px)] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
        style={{
          contain: "strict",
        }}
        data-view-mode={viewMode}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <div
            className={cn({
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2":
                viewMode === "grid",
            })}
            style={
              viewMode === "list"
                ? undefined
                : {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                  }
            }
          >
            {virtualItems.map((virtualRow) => {
              const task = tasks[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={cn({
                    "pb-4": viewMode === "list",
                  })}
                  style={
                    viewMode === "list"
                      ? {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }
                      : undefined
                  }
                >
                  <ItemComponent
                    task={task}
                    onDelete={onSetTask("delete")}
                    onEdit={onSetTask("edit")}
                    onUpdateStatus={onSetTask("updateStatus")}
                  />
                </div>
              );
            })}

            <CaseRender show={isFetching}>
              <div className="col-span-full text-center p-2 text-sm text-muted-foreground animate-pulse">
                Loading...
              </div>
            </CaseRender>
          </div>
        </div>
      </div>

      {/* MODALS */}

      <DeleteTask
        open={modalType === "delete" && !!taskId}
        onClose={onComplete}
        taskId={taskId!}
      />

      <EditTask
        open={modalType === "edit" && !!taskId}
        onClose={onComplete}
        taskId={taskId!}
      />

      <UpdateTaskStatus
        open={modalType === "updateStatus" && !!taskId}
        onClose={onComplete}
        taskId={taskId!}
      />
    </div>
  );
};

export default TaskList;
