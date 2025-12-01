"use client";

import React from "react";
import useLoggedInUser from "@/hooks/useLoggedInUser";
import { CaseRender } from "@/shared/case-render";
import QuickError from "@/shared/quick-error";
import { Skeleton } from "@/ui/skeleton";
import { User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const UserCard = () => {
  const { user, isLoading, isError, isAdmin, refetch } = useLoggedInUser();

  if (isError) {
    return (
      <QuickError
        message="Failed to load user information"
        onRetry={refetch}
        variant="card"
        size="sm"
      />
    );
  }

  if (isLoading || !user) {
    return (
      <div className="p-4 border rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-start gap-3">
        <div className="p-3 bg-primary/10 rounded-full">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{user.fullName}</h3>
            <CaseRender show={isAdmin}>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Admin</span>
              </div>
            </CaseRender>
          </div>
          <p className="text-xs text-muted-foreground truncate mb-2">
            {user.email}
          </p>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block px-2 py-1 rounded text-xs font-medium",
                isAdmin
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
