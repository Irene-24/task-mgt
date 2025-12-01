"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
  readonly size?: "sm" | "md" | "lg";
  readonly variant?: "inline" | "card";
}

const sizeClasses = {
  sm: "text-xs p-2 gap-2",
  md: "text-sm p-3 gap-3",
  lg: "text-base p-4 gap-4",
};

const buttonSizes = {
  sm: "h-6 px-2 text-xs",
  md: "h-8 px-3 text-sm",
  lg: "h-9 px-4 text-sm",
};

export default function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
  size = "sm",
  variant = "inline",
}: ErrorStateProps) {
  if (variant === "card") {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg flex items-center justify-between ${sizeClasses[size]}`}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-red-700 font-medium">{message}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className={`${buttonSizes[size]} border-red-300 text-red-700 hover:bg-red-100`}
            type="button"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <AlertCircle className="h-4 w-4 text-red-500 mr-2 shrink-0" />
      <p className="text-red-600 mr-3">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onRetry}
          className={`${buttonSizes[size]} border-red-300 text-red-700 hover:bg-red-100`}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}
