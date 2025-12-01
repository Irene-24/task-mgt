import { Input } from "@/ui/input";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/ui/button";
import { GetTasksParams } from "@/types/task.types";
import { SearchIcon, X, RotateCcw } from "lucide-react";
import { TASK_STATUS_DETAILS } from "@/lib/constants";
import { CaseRender } from "@/shared/case-render";

type FilterParams = Omit<GetTasksParams, "cursor">;

interface Props {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
  refetch: () => void;
}

const SortOrderOptions = [
  {
    label: "Created At (Newest First)",
    value: "desc",
  },
  {
    label: "Created At (Oldest First)",
    value: "asc",
  },
];

const TaskFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  refetch,
}: Props) => {
  const handleFieldChange = (
    field: keyof FilterParams,
    value: string | undefined
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  // Check if filters are not in default state
  const hasActiveFilters =
    !!filters.search ||
    filters.sortOrder !== "desc" ||
    //@ts-expect-error type issues
    filters.status !== "all";

  return (
    <section className="p-3 border btwn flex-col md:flex-row gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for tasks..."
          value={filters.search}
          onChange={(e) => handleFieldChange("search", e.target.value)}
          className="pl-10"
          type="search"
        />
      </div>

      <div className="grid basis-1/3 gap-2 grid-cols-2">
        <Select
          value={filters.status}
          onValueChange={(value) => handleFieldChange("status", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"all"}>All</SelectItem>
            {TASK_STATUS_DETAILS.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder}
          onValueChange={(value) => handleFieldChange("sortOrder", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            {SortOrderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className=" center gap-2 md:end">
        <CaseRender show={hasActiveFilters}>
          <Button
            variant="outline"
            aria-label="Clear filters"
            onClick={onClearFilters}
          >
            <X />
          </Button>
        </CaseRender>

        <Button
          variant="secondary"
          aria-label="Reset filters"
          onClick={refetch}
        >
          <RotateCcw className="scale-x-[-1]" />
        </Button>
      </div>
    </section>
  );
};

export default TaskFilters;
