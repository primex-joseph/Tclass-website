"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { downloadFacultyFile, getFacultyClassLists, getFacultyPeriods, type FacultyClassListsPayload, type FacultyPeriodsPayload } from "./faculty-portal-cache";
import { DisclaimerBanner, AyTermRow, TableViewOptions } from "./shared-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ClassListItem = NonNullable<FacultyClassListsPayload["items"]>[number];

export function ClassListsSection() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [items, setItems] = useState<ClassListItem[]>([]);
  const [canExport, setCanExport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let alive = true;

    getFacultyPeriods()
      .then((payload) => {
        if (!alive) return;
        const nextPeriods = payload.periods ?? [];
        setPeriods(nextPeriods);
        const initialPeriodId = String(payload.active_period_id ?? nextPeriods[0]?.id ?? "");
        if (initialPeriodId) {
          setLoading(true);
        }
        setSelectedPeriodId(initialPeriodId);
        if (!initialPeriodId) {
          setLoading(false);
          setItems([]);
        }
      })
      .catch((error) => {
        if (!alive) return;
        toast.error(error instanceof Error ? error.message : "Failed to load periods.");
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

    getFacultyClassLists(Number(selectedPeriodId), true)
      .then((payload) => {
        if (!alive) return;
        setItems(payload.items ?? []);
        setCanExport(Boolean(payload.can_export));
      })
      .catch((error) => {
        if (!alive) return;
        setItems([]);
        toast.error(error instanceof Error ? error.message : "Failed to load class lists.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedPeriodId]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.course_code} ${item.course_title} ${item.section_code} ${item.schedule_text}`.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const exportClassList = async (offeringId: number, format: 1 | 2) => {
    try {
      await downloadFacultyFile(`/faculty/class-lists/${offeringId}/export`, {
        filename: `class-list-${offeringId}-format-${format}.csv`,
      });
      toast.success(`Class list format ${format} exported.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export class list.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Class Lists</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View your actual class lists for the selected term and export them when your faculty access allows it.
        </p>
      </div>

      <DisclaimerBanner text="DISCLAIMER: Printed and exported class lists contain live student enrollment data. Handle them with care and only through authorized workflows." />
      <AyTermRow
        value={selectedPeriodId}
        onChange={(value) => {
          setLoading(true);
          setSelectedPeriodId(value);
        }}
        periods={periods ?? []}
        disableExport={!canExport}
        onExport={() => toast.success("Use the per-class export actions below.")}
      />

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by course, title, section, or schedule..."
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-0 dark:border-white/20 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">CODE</TableHead>
              <TableHead>TITLE</TableHead>
              <TableHead>SECTION</TableHead>
              <TableHead>SCHEDULE</TableHead>
              <TableHead>ENROLLED</TableHead>
              <TableHead className="text-right">LIST FORMAT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading class lists...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  No class lists found for this period.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((row) => (
                <TableRow key={row.offering_id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <TableCell className="font-medium">{row.course_code}</TableCell>
                  <TableCell className="italic">{row.course_title}</TableCell>
                  <TableCell>{row.section_code || "-"}</TableCell>
                  <TableCell>{row.schedule_text || "TBA"}</TableCell>
                  <TableCell>{row.enrolled_count}</TableCell>
                  <TableCell className="text-right">
                    {canExport ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => void exportClassList(row.offering_id, 1)}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          FORMAT 1
                        </button>
                        <span className="text-slate-400">|</span>
                        <button
                          onClick={() => void exportClassList(row.offering_id, 2)}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          FORMAT 2
                        </button>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No export access</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TableViewOptions />
    </div>
  );
}

