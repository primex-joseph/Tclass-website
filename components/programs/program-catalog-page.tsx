"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { ProgramsPageSkeleton } from "@/components/ui/loading-states";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

import { ProgramCard } from "./program-card";
import { getCatalogIcon } from "./program-catalog";
import type { ProgramCatalogItem, ProgramCategoryMeta, ProgramCatalogTab, ProgramCatalogType } from "./program-catalog";

type ProgramCatalogPageProps = {
  type: ProgramCatalogType;
  eyebrowLabel: string;
  heading: string;
  description: string;
  searchPlaceholder: string;
  itemLabel: string;
  summaryLabel: string;
  categoryMeta?: Record<string, ProgramCategoryMeta>;
  enrollPath: string;
};

type ProgramCatalogPayload = {
  programs?: ProgramCatalogItem[];
};

export function ProgramCatalogPage({
  type,
  eyebrowLabel,
  heading,
  description,
  searchPlaceholder,
  itemLabel,
  summaryLabel,
  categoryMeta = {},
  enrollPath,
}: ProgramCatalogPageProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [programs, setPrograms] = useState<ProgramCatalogItem[]>([]);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = (await apiFetch(`/programs/catalog?type=${type}`)) as ProgramCatalogPayload;
      setPrograms(Array.isArray(response.programs) ? response.programs : []);
    } catch (error) {
      setPrograms([]);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load programs.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  const filteredPrograms = useMemo(() => {
    let filtered = activeTab === "all" ? programs : programs.filter((program) => program.category === activeTab);

    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((program) =>
        [program.title, program.description, program.category, program.credential_label]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return filtered;
  }, [activeTab, programs, searchQuery]);

  const categoryCount = useMemo(
    () => new Set(programs.map((program) => program.category).filter(Boolean)).size,
    [programs],
  );

  const tabs = useMemo<ProgramCatalogTab[]>(() => {
    const categories = Array.from(new Set(programs.map((program) => program.category).filter(Boolean)));

    return [
      {
        id: "all",
        label: type === "certificate" ? "All Programs" : "All Courses",
        icon: getCatalogIcon("book-open"),
      },
      ...categories.map((category) => ({
        id: category,
        label:
          categoryMeta[category]?.label ??
          category
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
        icon: categoryMeta[category]?.icon ?? getCatalogIcon("book-open"),
      })),
    ];
  }, [categoryMeta, programs, type]);

  const resultLabel = useMemo(() => {
    const normalized = itemLabel.toLowerCase();
    return normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
  }, [itemLabel]);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setIsAnimating(true);
    window.setTimeout(() => {
      setActiveTab(tabId);
      setIsAnimating(false);
    }, 150);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/tclass.jpg')" }} />
        <div className="absolute inset-0 bg-white/92 dark:bg-slate-950/95" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
          <ProgramsPageSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/tclass.jpg')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/92 to-white/90 dark:from-slate-950/98 dark:via-slate-950/95 dark:to-slate-950/90" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-blue-100 dark:bg-slate-800 dark:group-hover:bg-blue-500/20">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <ThemeIconButton />
        </div>

        <div className="mb-10 mx-auto max-w-3xl text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <span>{eyebrowLabel}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">{heading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">{description}</p>
        </div>

        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 w-full rounded-full border border-slate-200 bg-white/80 pl-12 pr-4 text-slate-900 backdrop-blur-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mb-8 flex justify-center gap-6 text-sm sm:gap-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 sm:text-3xl">{programs.length}</p>
            <p className="text-slate-500 dark:text-slate-400">{itemLabel}</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 sm:text-3xl">{categoryCount}</p>
            <p className="text-slate-500 dark:text-slate-400">Tracks</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">100%</p>
            <p className="text-slate-500 dark:text-slate-400">{summaryLabel}</p>
          </div>
        </div>

        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="inline-flex flex-wrap justify-center gap-2 rounded-2xl bg-slate-100/80 p-1.5 backdrop-blur-sm dark:bg-slate-800/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm",
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                  )}
                >
                  {isActive ? <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30" /> : null}
                  <span className="relative flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-slate-100">{filteredPrograms.length}</span> {resultLabel}
            {filteredPrograms.length === 1 ? "" : "s"}
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-rose-200 bg-white/85 p-8 text-center shadow-lg shadow-slate-200/50 backdrop-blur-sm dark:border-rose-500/30 dark:bg-slate-900/85 dark:shadow-black/20">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Unable to load programs</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{errorMessage}</p>
            <Button className="mt-4" onClick={() => void loadPrograms()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid grid-cols-1 gap-5 transition-all duration-300 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3",
                isAnimating ? "scale-[0.98] opacity-50" : "scale-100 opacity-100",
              )}
            >
              {filteredPrograms.map((program, index) => (
                <ProgramCard key={program.id} program={program} enrollPath={enrollPath} index={index} />
              ))}
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="py-16 text-center sm:py-20">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No programs found</h3>
                <p className="mx-auto mt-2 max-w-sm text-slate-500 dark:text-slate-400">
                  Try adjusting your search or filter to find what you&apos;re looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 shadow-xl shadow-blue-500/20 sm:flex-row sm:p-8">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-white sm:text-xl">Need help choosing?</h3>
              <p className="mt-1 text-sm text-blue-100">Contact our admissions team for guidance.</p>
            </div>
            <Link href="/#send-message">
              <Button variant="secondary" className="bg-white px-6 font-semibold text-blue-600 hover:bg-blue-50">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
