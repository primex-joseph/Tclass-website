"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const THEME_KEY = "tclass_theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  useEffect(() => {
    // Keep root class aligned to persisted/system preference on client.
    const root = document.documentElement;
    const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = saved ?? (prefersDark ? "dark" : "light");
    root.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    root.classList.add("theme-transition");
    root.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem(THEME_KEY, nextTheme);

    window.setTimeout(() => root.classList.remove("theme-transition"), 380);
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`.trim()}
      title="Toggle theme"
    >
      <span className="theme-switch" aria-hidden="true">
        <span className="theme-switch-track">
          <Sun className="h-3.5 w-3.5 theme-switch-sun" />
          <Moon className="h-3.5 w-3.5 theme-switch-moon" />
        </span>
        <span className="theme-switch-thumb" />
      </span>
    </button>
  );
}

