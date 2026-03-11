"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  GraduationCap,
  HardHat,
  Laptop,
  Truck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { getCatalogTheme, type ProgramCatalogItem } from "./program-catalog";

type ProgramCardProps = {
  program: ProgramCatalogItem;
  enrollPath: string;
  index?: number;
};

function CatalogIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  switch (iconKey) {
    case "award":
      return <Award className={className} />;
    case "briefcase":
      return <Briefcase className={className} />;
    case "graduation-cap":
      return <GraduationCap className={className} />;
    case "hard-hat":
      return <HardHat className={className} />;
    case "laptop":
      return <Laptop className={className} />;
    case "truck":
      return <Truck className={className} />;
    case "users":
      return <Users className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

export function ProgramCard({ program, enrollPath, index = 0 }: ProgramCardProps) {
  const theme = getCatalogTheme(program.theme_key);
  const isInactive = !program.is_active;

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border-0 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 dark:bg-slate-900/80 dark:shadow-black/20",
        isInactive
          ? "opacity-80"
          : "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-black/30",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br sm:h-44", theme.from, theme.to)}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30" />
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/20" />
        </div>

        <div className="relative flex h-full items-center justify-between px-5 sm:px-6">
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm sm:h-20 sm:w-20", theme.iconBg)}>
            <CatalogIcon iconKey={program.icon_key} className="h-8 w-8 text-white sm:h-10 sm:w-10" />
          </div>

          <div className="flex flex-col items-end gap-2">
            {program.is_limited_slots ? (
              <Badge className="border border-amber-400/50 bg-amber-500/30 text-white backdrop-blur-sm">
                Limited slots
              </Badge>
            ) : null}
            <Badge
              className={cn(
                "border text-white backdrop-blur-sm",
                isInactive
                  ? "border-rose-300/50 bg-rose-500/35"
                  : "border-emerald-300/50 bg-emerald-500/30",
              )}
            >
              {isInactive ? "Inactive" : "Active"}
            </Badge>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className={cn(
          "text-lg font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-xl",
          isInactive ? "" : "transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400",
        )}>
          {program.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{program.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            {program.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CatalogIcon iconKey={program.icon_key} className="h-4 w-4 text-slate-400" />
            {program.credential_label}
          </span>
        </div>

        <div className="mt-5 pt-2">
          {isInactive ? (
            <Button
              disabled
              className="w-full rounded-xl bg-slate-300 font-semibold text-slate-600 opacity-100 dark:bg-slate-800 dark:text-slate-400"
            >
              Enrollment Unavailable
            </Button>
          ) : (
            <Link href={`${enrollPath}?program=${encodeURIComponent(program.title)}`}>
              <Button className="w-full rounded-xl bg-slate-900 font-semibold text-white transition-all duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                <span className="relative flex items-center justify-center gap-2">
                  Enroll Now
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
