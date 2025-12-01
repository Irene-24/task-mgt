import React from "react";
import { Task } from "@/types/task.types";
import Truncatable from "@/shared/truncatable";
import { cn } from "@/lib/utils";
import { TASK_STYLES } from "@/lib/app-styles";
import TaskActions from "./TaskActions";

interface Props {
  task: Task;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onUpdateStatus?: (taskId: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete, onUpdateStatus }: Props) => {
  const badgeClass = cn(
    TASK_STYLES.badges.shared,
    (TASK_STYLES.badges as Record<string, string>)[task.status] ?? ""
  );

  return (
    <div className={cn(TASK_STYLES.task, "h-full")}>
      <div className="flex flex-col h-full relative">
        <TaskActions
          onEdit={() => onEdit?.(task.id)}
          onDelete={() => onDelete?.(task.id)}
          onUpdateStatus={() => onUpdateStatus?.(task.id)}
          buttonClassName="absolute -top-2 -right-2"
        />

        <h3 className={cn(TASK_STYLES.header, "w-full")}>{task.title}</h3>

        {task.description && (
          <Truncatable
            content={task.description}
            as="p"
            className={cn(TASK_STYLES.description, " flex-1 pr-8")}
          />
        )}
        <div className="mt-auto">
          <span className={badgeClass}>{task.status}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
