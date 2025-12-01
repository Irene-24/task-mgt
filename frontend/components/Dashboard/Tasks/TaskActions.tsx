import React, { ComponentProps } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useLoggedInUser from "@/hooks/useLoggedInUser";
import { Button } from "@/ui/button";
import { EllipsisVertical, Pencil, Trash2, CheckCircle } from "lucide-react";

import { CaseRender } from "@/shared/case-render";
import { cn } from "@/lib/utils";

interface TaskActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: () => void;
  buttonClassName?: ComponentProps<"button">["className"];
}

const TaskActions = ({
  onEdit,
  onDelete,
  onUpdateStatus,
  buttonClassName,
}: TaskActionsProps) => {
  const { isAdmin } = useLoggedInUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn("scale-75", buttonClassName)}
          aria-label="Actions"
          variant="outline"
          size="icon"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onUpdateStatus}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Update Status</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit Task</span>
          </DropdownMenuItem>

          <CaseRender show={isAdmin}>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Task</span>
            </DropdownMenuItem>
          </CaseRender>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActions;
