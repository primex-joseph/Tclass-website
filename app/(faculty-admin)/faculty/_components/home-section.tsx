"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, UserCircle, Building2, Briefcase, BookMarked, CalendarClock } from "lucide-react";

import { getFacultyDashboardSummary, getFacultyMe, getFacultyPeriods, type FacultyDashboardSummaryPayload } from "./faculty-portal-cache";

type HomeState = {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  loadCount: string;
  todaySchedule: Array<{
    offering_id: number;
    course_code: string;
    course_title: string;
    section_code: string;
    schedule_text: string;
    room_code: string;
  }>;
};

const EMPTY_STATE: HomeState = {
  name: "Faculty Portal",
  employeeId: "No employee ID yet",
  department: "No department assigned",
  position: "Faculty",
  loadCount: "0 Classes",
  todaySchedule: [],
};

export function HomeSection() {
  const [state, setState] = useState<HomeState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const [mePayload, periodsPayload] = await Promise.all([getFacultyMe(), getFacultyPeriods()]);
        const periodId = Number(periodsPayload.active_period_id ?? 0);
        const summaryPayload = periodId > 0 ? await getFacultyDashboardSummary<FacultyDashboardSummaryPayload>(periodId) : {};

        if (!alive) return;

        setState({
          name: mePayload.user?.name?.trim() || EMPTY_STATE.name,
          employeeId: summaryPayload.profile?.employee_id?.trim() || EMPTY_STATE.employeeId,
          department: summaryPayload.profile?.department?.trim() || EMPTY_STATE.department,
          position: summaryPayload.profile?.position?.trim() || EMPTY_STATE.position,
          loadCount: `${Number(summaryPayload.stats?.load_count ?? 0)} Classes`,
          todaySchedule: summaryPayload.today_schedule ?? [],
        });
      } catch {
        if (!alive) return;
        setState(EMPTY_STATE);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
          Hello, {state.name}!
        </h1>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
          Welcome to your faculty portal. Access your schedules, class lists, and more.
        </p>
      </div>

      <div className="animate-fade-in-up motion-delay-50 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          <strong>Safari Users:</strong> If you cannot expand menus, please try Chrome or Edge for the best experience.
        </span>
      </div>

      <div className="animate-fade-in-up motion-delay-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            ADVISORY: ONEDRIVE STORAGE LIMIT
          </p>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            This is a reminder to everyone of the adjustment to Microsoft 365 storage allocations
            that took effect on July 1, 2025.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60">
                  <th className="border-b border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700 dark:border-white/10 dark:text-slate-300">
                    User Type
                  </th>
                  <th className="border-b border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700 dark:border-white/10 dark:text-slate-300">
                    New Storage Limit
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="border-b border-slate-100 px-4 py-2.5 dark:border-white/5">Active Employee and Faculty</td>
                  <td className="border-b border-slate-100 px-4 py-2.5 font-medium text-blue-600 dark:border-white/5 dark:text-blue-400">25GB</td>
                </tr>
                <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-4 py-2.5">Active Students</td>
                  <td className="px-4 py-2.5 font-medium text-blue-600 dark:text-blue-400">3GB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Inactive Employee, Faculty, and Student accounts will be permanently deleted, resulting
            in the loss of access to their OneDrive accounts.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            NOTE: Files uploaded to MSTeams will count towards your total storage allocation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="animate-fade-in-up motion-delay-150 group rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            YOUR SCHEDULE TODAY
          </p>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading schedule...</p>
          ) : state.todaySchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <CalendarClock className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No classes scheduled today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.todaySchedule.slice(0, 3).map((item) => (
                <div key={item.offering_id} className="rounded-lg border border-blue-100 bg-blue-50/80 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.course_code}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.section_code} · {item.room_code}</p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">{item.schedule_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <InfoCard icon={UserCircle} label="EMPLOYEE ID" value={state.employeeId} accent="blue" />
        <InfoCard icon={Building2} label="DEPARTMENT" value={state.department} accent="indigo" />
        <InfoCard icon={Briefcase} label="POSITION" value={state.position} accent="emerald" />
        <InfoCard icon={BookMarked} label="LOAD COUNT" value={state.loadCount} accent="amber" />
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof UserCircle;
  label: string;
  value: string;
  accent: "blue" | "indigo" | "emerald" | "amber";
}) {
  const accentClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:border-blue-700/50 hover:border-blue-200",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:border-indigo-700/50 hover:border-indigo-200",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:border-emerald-700/50 hover:border-emerald-200",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:border-amber-700/50 hover:border-amber-200",
  } as const;

  return (
    <div className="animate-fade-in-up group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-slate-900">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${accentClasses[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
