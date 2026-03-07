"use client";

import { type KeyboardEvent } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GlobalSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
};

export function GlobalSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onEnter,
  className,
  inputClassName,
  iconClassName,
}: GlobalSearchInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !onEnter) return;
    event.preventDefault();
    onEnter();
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
          iconClassName,
        )}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-full border-slate-200 bg-slate-50/90 !pl-11 pr-3 text-sm text-slate-700 placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-white/15 dark:bg-slate-900/85 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:bg-slate-900 dark:focus-visible:ring-blue-500/30",
          inputClassName,
        )}
      />
    </div>
  );
}
