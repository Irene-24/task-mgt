"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider"; // adjust path if needed
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeSwitcherSize = "sm" | "md" | "lg";

interface ThemeSwitcherProps {
  size?: ThemeSwitcherSize;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

const sizeConfig: Record<ThemeSwitcherSize, { icon: number; button: string }> =
  {
    sm: { icon: 16, button: "h-8 w-8" },
    md: { icon: 20, button: "h-10 w-10" },
    lg: { icon: 24, button: "h-12 w-12" },
  };

export function ThemeSwitcher({
  size = "md",
  variant = "ghost",
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const config = sizeConfig[size];

  let themeIcon = <Monitor size={config.icon} />;
  if (theme === "light") {
    themeIcon = <Sun size={config.icon} />;
  } else if (theme === "dark") {
    themeIcon = <Moon size={config.icon} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={config.button}
          aria-label="Toggle theme"
        >
          {themeIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
