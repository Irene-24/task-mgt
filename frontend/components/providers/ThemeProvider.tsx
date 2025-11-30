"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  const updateTheme = useCallback(
    (t: Theme) => {
      setTheme(t);
      if (globalThis.window !== undefined) {
        localStorage.setItem("theme", t);
      }
    },
    [setTheme]
  );

  // apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;

    // determine final theme
    let finalTheme: Theme;
    if (theme === "system") {
      const prefersDark = globalThis.window?.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      finalTheme = prefersDark ? "dark" : "light";
    } else {
      finalTheme = theme;
    }

    if (finalTheme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme: updateTheme }),
    [theme, updateTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
