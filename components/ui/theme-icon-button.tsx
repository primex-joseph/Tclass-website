"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "tclass_theme";

export function ThemeIconButton({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentTheme = saved ?? (prefersDark ? "dark" : "light");
    
    root.classList.toggle("dark", currentTheme === "dark");
    setIsDark(currentTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentlyDark = root.classList.contains("dark");
    const nextTheme = currentlyDark ? "light" : "dark";

    root.classList.add("theme-transition");
    root.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem(THEME_KEY, nextTheme);
    setIsDark(!currentlyDark);

    window.setTimeout(() => root.classList.remove("theme-transition"), 380);
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/25 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}
