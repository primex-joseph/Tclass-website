"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { AvatarActionsMenu } from "@/components/ui/avatar-actions-menu";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogoutModal } from "@/components/ui/logout-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StudentTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const searchItems = useMemo(
    () => [
      { label: "Dashboard", href: "/student", keywords: "home dashboard overview" },
      { label: "Enrollment", href: "/student/enrollment", keywords: "transactions pre enlist enlistment" },
      { label: "Courses", href: "/student/courses", keywords: "subjects classes" },
      { label: "Assignments", href: "/student/assignments", keywords: "tasks submission submit work" },
      { label: "Grades", href: "/student/grades", keywords: "gwa marks scores" },
      { label: "Calendar", href: "/student/calendar", keywords: "schedule dates events" },
      { label: "Enrolled Subjects", href: "/student/reports/enrolled-subjects", keywords: "reports subjects" },
      { label: "Curriculum Evaluation", href: "/student/reports/curriculum-evaluation", keywords: "curriculum report evaluation" },
    ],
    []
  );

  const normalizedSearch = mobileSearchQuery.trim().toLowerCase();
  const filteredSearchItems = normalizedSearch
    ? searchItems.filter((item) =>
        `${item.label} ${item.keywords}`.toLowerCase().includes(normalizedSearch)
      )
    : [];

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    document.cookie = "tclass_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "tclass_role=; path=/; max-age=0; samesite=lax";
    router.push("/");
    router.refresh();
  };

  const closeMobileOverlays = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setMobileSearchQuery("");
  };

  const openMobileRoute = (href: string) => {
    closeMobileOverlays();
    router.push(href);
  };

  useEffect(() => {
    if (mobileMenuOpen || mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, mobileSearchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen && !mobileSearchOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileOverlays();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, mobileSearchOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) {
        closeMobileOverlays();
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const menuPanelClass =
    "z-[80] min-w-[320px] rounded-xl border border-slate-200 bg-white/98 p-1 text-slate-900 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-slate-950/98 dark:text-slate-100";
  const menuItemClass =
    "px-3 py-2 text-slate-700 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white";
  const menuAccentItemClass =
    "px-3 py-2 font-semibold text-blue-700 focus:bg-blue-50 dark:text-blue-300 dark:focus:bg-blue-500/15";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_8px_20px_rgba(15,23,42,0.05)] backdrop-blur-md dark:border-white/12 dark:bg-slate-950/95 dark:shadow-[0_8px_22px_rgba(0,0,0,0.45)]">
      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 xl:gap-6 min-w-0">
            <Link href="/student" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">TClass</span>
              <span className="hidden lg:inline-flex text-xs rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-blue-700 dark:border-blue-300/30 dark:bg-blue-500/20 dark:text-blue-200">Student Portal</span>
            </Link>

            <nav className="hidden xl:flex items-center gap-5 text-sm text-slate-700 dark:text-slate-200">
              <Link href="/student" className={pathname === "/student" ? "nav-chip nav-chip-active" : "nav-chip"}>Dashboard</Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button id="student-nav-transactions-trigger" className="nav-chip inline-flex items-center gap-1">
                    Transactions <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={10} className={menuPanelClass}>
                  <DropdownMenuItem className={menuItemClass}>Change Password</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Student Profile</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-white/10" />
                  <DropdownMenuItem className={menuItemClass}>Pre-enlistment</DropdownMenuItem>
                  <DropdownMenuItem asChild className={menuAccentItemClass}>
                    <Link href="/student/enrollment">Enrollment</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Add / Cross-Enroll / Drop Subject</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Assessment</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Amount Due</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button id="student-nav-reports-trigger" className="nav-chip inline-flex items-center gap-1">
                    Reports <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={10} className={`${menuPanelClass} min-w-[420px]`}>
                  <DropdownMenuItem asChild className={menuAccentItemClass}>
                    <Link href="/student/reports/enrolled-subjects">Enrolled Subjects</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Class Absences</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-white/10" />
                  <DropdownMenuItem className={menuItemClass}>Term Grades (Match Curriculum)</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Final Grades (Match Curriculum)</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>General Weighted Average (Match Curriculum)</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-white/10" />
                  <DropdownMenuItem className={menuItemClass}>Term Grades (Ignore Curriculum)</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>Final Grades (Ignore Curriculum)</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>General Weighted Average (Ignore Curriculum)</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-white/10" />
                  <DropdownMenuItem asChild className={menuAccentItemClass}>
                    <Link href="/student/reports/curriculum-evaluation">Curriculum Evaluation</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button id="student-nav-help-trigger" className="nav-chip inline-flex items-center gap-1">
                    Help <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={10} className={`${menuPanelClass} min-w-[180px]`}>
                  <DropdownMenuItem className={menuItemClass}>Support</DropdownMenuItem>
                  <DropdownMenuItem className={menuItemClass}>About</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="w-44 rounded-full border-slate-200 bg-slate-50/90 pl-9 text-slate-700 placeholder:text-slate-500 focus-visible:bg-white lg:w-48 xl:w-56 2xl:w-64 dark:border-white/15 dark:bg-slate-900/85 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:bg-slate-900" placeholder="Search courses & assignments..." />
            </div>
            {!mobileMenuOpen && (
              <button
                type="button"
                className="lg:hidden inline-flex rounded-full border border-transparent p-2 text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMobileSearchOpen(true);
                }}
              >
                <Search className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
            )}
            <button className="relative inline-flex rounded-full border border-transparent p-2 text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 pulse-ring" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <AvatarActionsMenu
                initials="ST"
                name="Student User"
                subtitle="Student Portal"
                onLogout={handleLogout}
                triggerId="student-avatar-menu-trigger"
              />
            </div>
            <button
              type="button"
              className="xl:hidden inline-flex items-center justify-center rounded-full border border-transparent p-2 text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:text-slate-200 dark:hover:border-white/15 dark:hover:bg-white/10"
              onClick={() => {
                setMobileSearchOpen(false);
                setMobileMenuOpen((prev) => !prev);
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <div
      className={`fixed inset-0 z-[120] xl:hidden transition-[visibility] duration-300 ${
        mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!mobileMenuOpen}
    >
      <button
        type="button"
        aria-label="Close sidebar"
        className={`absolute inset-0 bg-slate-950/62 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Student mobile navigation"
        className={`absolute left-0 top-0 h-full w-[84%] max-w-[21rem] border-r border-slate-200 bg-white shadow-[0_26px_65px_rgba(15,23,42,0.32)] transition-transform duration-300 ease-out dark:border-white/15 dark:bg-slate-950 dark:shadow-[0_26px_65px_rgba(0,0,0,0.65)] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-white/15">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 p-2 shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">TClass</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Student Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-b border-slate-200 px-3 pb-3 pt-3 dark:border-white/10">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/15 dark:bg-slate-900">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Theme</span>
              <ThemeIconButton />
            </div>
          </div>

          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
            Navigation
          </p>
          <div className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-4">
            <Link
              href="/student"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname === "/student"
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/student/enrollment"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/enrollment")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Enrollment
            </Link>
            <Link
              href="/student/courses"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/courses")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="/student/assignments"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/assignments")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              Assignments
            </Link>
            <Link
              href="/student/grades"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/grades")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              Grades
            </Link>
            <Link
              href="/student/reports/enrolled-subjects"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/reports/enrolled-subjects")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Enrolled Subjects
            </Link>
            <Link
              href="/student/reports/curriculum-evaluation"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/reports/curriculum-evaluation")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              Curriculum Evaluation
            </Link>
            <Link
              href="/student/calendar"
              onClick={closeMobileOverlays}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                pathname.startsWith("/student/calendar")
                  ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Link>
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-white/15">
            <button
              onClick={() => {
                closeMobileOverlays();
                handleLogout();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </div>

    <Dialog
      open={mobileSearchOpen}
      onOpenChange={(open) => {
        setMobileSearchOpen(open);
        if (!open) {
          setMobileSearchQuery("");
        }
      }}
    >
      <DialogContent className="flex h-[62vh] min-h-[24rem] w-[95vw] max-w-xl flex-col overflow-hidden border border-blue-200/70 bg-white p-0 shadow-2xl dark:border-blue-900/70 dark:bg-slate-950">
        <DialogHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-4 dark:border-blue-900/40 dark:from-blue-950/45 dark:to-cyan-950/30">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Find student pages quickly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoFocus
              value={mobileSearchQuery}
              onChange={(event) => setMobileSearchQuery(event.target.value)}
              placeholder="Search pages..."
              className="h-11 rounded-xl border-slate-300 bg-slate-50 pl-9 text-slate-900 dark:border-white/20 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openMobileRoute("/student")}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => openMobileRoute("/student/enrollment")}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Enrollment
            </button>
            <button
              type="button"
              onClick={() => openMobileRoute("/student/assignments")}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Assignments
            </button>
            <button
              type="button"
              onClick={() => openMobileRoute("/student/grades")}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Grades
            </button>
          </div>

          <div className="flex-1 min-h-[10rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-900/50">
            {normalizedSearch ? (
              filteredSearchItems.length > 0 ? (
                <div className="space-y-1">
                  {filteredSearchItems.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => openMobileRoute(item.href)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.href}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-4 text-sm text-slate-600 dark:text-slate-300">
                  No matches found for &quot;{mobileSearchQuery}&quot;.
                </p>
              )
            ) : (
              <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                Search results will appear here.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setMobileSearchOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <nav className="fixed inset-x-3 bottom-3 z-[70] xl:hidden">
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-slate-950/92">
        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => router.push("/student")}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
              pathname === "/student"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            type="button"
            onClick={() => router.push("/student/enrollment")}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
              pathname.startsWith("/student/enrollment")
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Enroll
          </button>
          <button
            type="button"
            onClick={() => router.push("/student/reports/enrolled-subjects")}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
              pathname.startsWith("/student/reports")
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <FileText className="h-4 w-4" />
            Reports
          </button>
          <button
            type="button"
            onClick={() => router.push("/student/calendar")}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
              pathname.startsWith("/student/calendar")
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(false);
              setMobileMenuOpen(true);
            }}
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
        </div>
      </div>
      </nav>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
