"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearFacultyPeriodCache,
  downloadFacultyFile,
  getFacultyClassSchedules,
  getFacultyPeriods,
  updateFacultySchedule,
  type FacultyPeriodsPayload,
  type FacultySchedulePayload,
} from "./faculty-portal-cache";
import { DisclaimerBanner, AyTermRow } from "./shared-ui";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};
const TIME_SLOTS = Array.from({ length: 15 }, (_, index) => index + 7);
const ROW_HEIGHT = 56;

type ScheduleItem = NonNullable<FacultySchedulePayload["items"]>[number];

function formatHour(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

function extractHour(value: string) {
  const [hours] = value.split(":");
  return Number(hours || 0);
}

function trimTime(value: string) {
  return value.slice(0, 5);
}

export function ClassSchedulesSection() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [form, setForm] = useState({
    day_of_week: "Mon",
    start_time: "07:00",
    end_time: "08:00",
  });

  useEffect(() => {
    let alive = true;

    getFacultyPeriods()
      .then((payload) => {
        if (!alive) return;
        const nextPeriods = payload.periods ?? [];
        setPeriods(nextPeriods);
        const initialPeriod = String(payload.active_period_id ?? nextPeriods[0]?.id ?? "");
        setSelectedPeriodId(initialPeriod);
        if (!initialPeriod) {
          setLoading(false);
          setItems([]);
        }
      })
      .catch((error) => {
        if (!alive) return;
        toast.error(error instanceof Error ? error.message : "Failed to load faculty periods.");
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) {
      return;
    }

    let alive = true;
    setLoading(true);

    getFacultyClassSchedules(Number(selectedPeriodId), true)
      .then((payload) => {
        if (!alive) return;
        setItems(payload.items ?? []);
        setCanManage(Boolean(payload.can_manage));
        setCanExport(Boolean(payload.can_export));
      })
      .catch((error) => {
        if (!alive) return;
        setItems([]);
        toast.error(error instanceof Error ? error.message : "Failed to load class schedules.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedPeriodId]);

  const blocksByDay = useMemo(() => {
    const grouped: Record<string, ScheduleItem[]> = {};
    for (const item of items) {
      const day = item.day_of_week || "Mon";
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    }
    return grouped;
  }, [items]);

  const selectedPeriod = periods?.find((period) => String(period.id) === selectedPeriodId);

  const openEditor = (item: ScheduleItem) => {
    if (!canManage) return;
    setSelectedItem(item);
    setForm({
      day_of_week: item.day_of_week,
      start_time: trimTime(item.start_time),
      end_time: trimTime(item.end_time),
    });
  };

  const handleSave = async () => {
    if (!selectedItem || !selectedPeriodId) return;

    setSaving(true);
    try {
      await updateFacultySchedule(selectedItem.offering_id, form);
      clearFacultyPeriodCache(Number(selectedPeriodId));
      const payload = await getFacultyClassSchedules(Number(selectedPeriodId), true);
      setItems(payload.items ?? []);
      setCanManage(Boolean(payload.can_manage));
      setCanExport(Boolean(payload.can_export));
      toast.success("Schedule updated successfully.");
      setSelectedItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update schedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!selectedPeriodId) return;

    try {
      await downloadFacultyFile(`/faculty/class-schedules/export?period_id=${selectedPeriodId}`, {
        filename: `faculty-schedules-${selectedPeriodId}.csv`,
      });
      toast.success("Schedules exported.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export schedules.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Class Schedules</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View your live teaching schedule for the selected enrollment period.
        </p>
      </div>

      <DisclaimerBanner text="DISCLAIMER: Schedule adjustments and exports follow faculty workflow permissions. Registrar-level faculty can update and export the full schedule view." />
      <AyTermRow
        value={selectedPeriodId}
        onChange={setSelectedPeriodId}
        periods={periods ?? []}
        onExport={handleExport}
        disableExport={!canExport || !selectedPeriodId}
      />

      {selectedPeriod ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Viewing {selectedPeriod.name}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {loading ? (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading schedule...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No class schedules were found for this faculty account in the selected period.
          </div>
        ) : (
          <div className="min-w-[760px]">
            <div className="grid border-b border-slate-200 dark:border-white/10" style={{ gridTemplateColumns: "64px repeat(6, 1fr)" }}>
              <div className="border-r border-slate-200 p-2 dark:border-white/10" />
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="border-r border-slate-200 p-2 text-center text-xs font-semibold text-slate-700 last:border-r-0 dark:border-white/10 dark:text-slate-300"
                >
                  {DAY_LABELS[day]}
                </div>
              ))}
            </div>

            {TIME_SLOTS.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-slate-100 last:border-b-0 dark:border-white/5"
                style={{ gridTemplateColumns: "64px repeat(6, 1fr)", minHeight: `${ROW_HEIGHT}px` }}
              >
                <div className="flex items-start justify-end border-r border-slate-200 px-2 pt-1 dark:border-white/10">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatHour(hour)}</span>
                </div>
                {DAYS.map((day) => {
                  const blocks = (blocksByDay[day] ?? []).filter((item) => extractHour(item.start_time) === hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="relative border-r border-slate-100 last:border-r-0 dark:border-white/5"
                      style={{ minHeight: `${ROW_HEIGHT}px` }}
                    >
                      {blocks.map((block) => {
                        const spanHours = Math.max((extractHour(block.end_time) - extractHour(block.start_time)) || 1, 1);
                        return (
                          <button
                            key={block.offering_id}
                            type="button"
                            className="absolute inset-x-0.5 top-0.5 z-10 overflow-hidden rounded bg-blue-500 px-1.5 py-1 text-left text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-default disabled:hover:bg-blue-500"
                            style={{ height: `calc(${spanHours * ROW_HEIGHT}px - 4px)` }}
                            onClick={() => openEditor(block)}
                            disabled={!canManage}
                            title={canManage ? "Edit schedule" : `${block.course_code} ${block.section_code}`}
                          >
                            <p className="text-[10px] font-semibold leading-tight">{block.course_code}</p>
                            <p className="text-[10px] font-bold leading-tight">{block.section_code || block.course_title}</p>
                            <p className="text-[10px] leading-tight opacity-90">{block.room_code || "Room TBD"}</p>
                            <p className="text-[10px] leading-tight opacity-80">{block.schedule_text}</p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Schedule Summary</p>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div
              key={`summary-${item.offering_id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.course_code} - {item.course_title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.section_code || "No section"} • {item.teacher_name || "Teacher not linked yet"}
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 dark:text-slate-300">
                <p>{item.schedule_text}</p>
                <p>{item.room_code || "Room TBD"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => (!open ? setSelectedItem(null) : null)}>
        <DialogContent hideCloseButton className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Registrar-enabled faculty can adjust the live class schedule for this offering.
            </DialogDescription>
          </DialogHeader>
          {selectedItem ? (
            <div className="grid gap-4 py-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedItem.course_code} - {selectedItem.course_title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedItem.section_code || "No section assigned"}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule-day">Day</Label>
                <select
                  id="schedule-day"
                  value={form.day_of_week}
                  onChange={(event) => setForm((prev) => ({ ...prev, day_of_week: event.target.value }))}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-white/20 dark:bg-slate-950 dark:text-slate-100"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{DAY_LABELS[day]}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="schedule-start">Start time</Label>
                  <Input
                    id="schedule-start"
                    type="time"
                    value={form.start_time}
                    onChange={(event) => setForm((prev) => ({ ...prev, start_time: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule-end">End time</Label>
                  <Input
                    id="schedule-end"
                    type="time"
                    value={form.end_time}
                    onChange={(event) => setForm((prev) => ({ ...prev, end_time: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedItem(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

