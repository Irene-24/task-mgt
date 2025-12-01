import { ThemeSwitcher } from "@/shared/theme-switcher";
import React from "react";
import CreateTask from "./Tasks/CreateTask";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="p-4 btwn">
        <CreateTask />
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default AppHeader;
