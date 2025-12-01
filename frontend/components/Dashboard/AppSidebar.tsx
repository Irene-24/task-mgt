"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import useLogout from "@/hooks/useLogout";
import { Button } from "@/ui/button";
import { CheckCircle2, LogOutIcon } from "lucide-react";
import TaskStats from "./Tasks/TaskStats";
import UserCard from "./UserCard";

export function AppSidebar() {
  const { logout } = useLogout();

  return (
    <Sidebar className="min-h-screen " collapsible="icon">
      <SidebarHeader>
        <div className=" py-4 center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">TaskManager</h1>
            <p className="text-xs text-muted-foreground">
              Manage your work efficiently
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <TaskStats />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserCard />
        <Button onClick={logout} variant="outline">
          <LogOutIcon />

          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
