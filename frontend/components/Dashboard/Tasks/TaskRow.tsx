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

const TaskRow = ({ task, onEdit, onDelete, onUpdateStatus }: Props) => {
  const badgeClass = cn(
    TASK_STYLES.badges.shared,
    (TASK_STYLES.badges as Record<string, string>)[task.status] ?? ""
  );

  return (
    <div className={cn(TASK_STYLES.task)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1">
        <div className="flex-1">
          <h3 className={cn(TASK_STYLES.header)}>{task.title}</h3>
          {task.description && (
            <Truncatable
              content={task.description}
              as="p"
              className={TASK_STYLES.description}
            />
          )}
        </div>
        <div className="flex-col items-end flex gap-1">
          <span className={badgeClass}>{task.status}</span>

          <TaskActions
            onEdit={() => onEdit?.(task.id)}
            onDelete={() => onDelete?.(task.id)}
            onUpdateStatus={() => onUpdateStatus?.(task.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskRow;
