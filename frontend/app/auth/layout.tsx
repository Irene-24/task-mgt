import React, { PropsWithChildren } from "react";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen p-2 center relative">
      {/* Theme Switcher in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher variant="default" />
      </div>

      <section className="w-full max-w-md">{children}</section>
    </div>
  );
};

export default AuthLayout;
