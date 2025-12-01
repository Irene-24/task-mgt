"use client";

import { useGetTaskStatsQuery } from "@/services/task";
import { Skeleton } from "@/ui/skeleton";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const TaskStats = () => {
  const { data, isLoading, isError } = useGetTaskStatsQuery();

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const stats = data.stats;

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Task Overview
      </h3>
      <div className="space-y-2">
        {/* Total Tasks */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="p-2 rounded-md bg-primary/10">
            <ListTodo className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="p-2 rounded-md bg-orange-500/10">
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-lg font-bold">{stats.pending}</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="p-2 rounded-md bg-green-500/10">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-bold">{stats.completed}</p>
          </div>
        </div>

        {/* Completion Rate */}
        {stats.total > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-semibold">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-green-500 transition-all duration-500"
                )}
                style={{
                  width: `${(stats.completed / stats.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStats;
