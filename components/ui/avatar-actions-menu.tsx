"use client";

import { ChevronDown, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AvatarActionsMenuProps {
  initials: string;
  onLogout: () => void;
  name?: string;
  subtitle?: string;
  triggerId?: string;
  align?: "start" | "center" | "end";
  fallbackClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function AvatarActionsMenu({
  initials,
  onLogout,
  name,
  subtitle,
  triggerId,
  align = "end",
  fallbackClassName,
  triggerClassName,
  contentClassName,
}: AvatarActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          id={triggerId}
          className={cn(
            "inline-flex items-center gap-1 rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            triggerClassName
          )}
          aria-label="Open account menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className={cn(
                "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100",
                fallbackClassName
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          "w-56 border-slate-200/80 bg-white/98 p-2 text-slate-900 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-slate-950/98 dark:text-slate-100",
          contentClassName
        )}
      >
        {(name || subtitle) && (
          <>
            <DropdownMenuLabel className="px-2 py-1.5">
              {name && <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">{name}</p>}
              {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
          </>
        )}

        <div className="flex items-center justify-between rounded-md px-2 py-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
          <ThemeToggle className="theme-toggle-inline" />
        </div>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />

        <DropdownMenuItem
          onClick={onLogout}
          className="gap-2 rounded-md text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-300 dark:focus:bg-red-500/20 dark:focus:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
