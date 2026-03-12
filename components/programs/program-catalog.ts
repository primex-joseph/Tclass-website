"use client";

import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  HardHat,
  Laptop,
  Truck,
  Users,
} from "lucide-react";

export type ProgramCatalogType = "certificate" | "diploma";

export type ProgramCatalogItem = {
  id: number;
  type: ProgramCatalogType;
  title: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  credential_label: string;
  badge_text: string;
  icon_key: string;
  theme_key: string;
  sort_order: number;
  is_limited_slots: boolean;
  is_active: boolean;
  slots_limit?: number | null;
  enrolled_count?: number;
  slots_left?: number;
};

export type ProgramCatalogTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type ProgramCategoryMeta = {
  label: string;
  icon: LucideIcon;
};

export const catalogIconMap: Record<string, LucideIcon> = {
  award: Award,
  "book-open": BookOpen,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  "hard-hat": HardHat,
  laptop: Laptop,
  truck: Truck,
  users: Users,
};

export const catalogThemeMap: Record<string, { from: string; to: string; iconBg: string }> = {
  blue: {
    from: "from-blue-700",
    to: "to-cyan-500",
    iconBg: "bg-blue-500/20",
  },
  green: {
    from: "from-emerald-600",
    to: "to-teal-500",
    iconBg: "bg-emerald-500/20",
  },
  orange: {
    from: "from-orange-600",
    to: "to-amber-500",
    iconBg: "bg-orange-500/20",
  },
  purple: {
    from: "from-violet-600",
    to: "to-purple-500",
    iconBg: "bg-violet-500/20",
  },
};

export const getCatalogIcon = (key: string): LucideIcon => catalogIconMap[key] ?? BookOpen;

export const getCatalogTheme = (key: string) =>
  catalogThemeMap[key] ?? {
    from: "from-blue-700",
    to: "to-cyan-500",
    iconBg: "bg-blue-500/20",
  };
