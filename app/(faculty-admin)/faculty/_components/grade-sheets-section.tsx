"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, ExternalLink, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  clearFacultyPeriodCache,
  getFacultyGradeSheetDetail,
  getFacultyGradeSheets,
  getFacultyPeriods,
  postFacultyGradeSheet,
  saveFacultyGradeSheet,
  type FacultyGradeSheetDetailPayload,
  type FacultyGradeSheetsPayload,
  type FacultyPeriodsPayload,
} from "./faculty-portal-cache";
import { DisclaimerBanner, AyTermRow, TableViewOptions } from "./shared-ui";

type GradeSheetRow = NonNullable<FacultyGradeSheetsPayload["items"]>[number];
type GradeDetailRow = NonNullable<FacultyGradeSheetDetailPayload["items"]>[number];
type GradeRule = NonNullable<FacultyGradeSheetDetailPayload["grading_system"]>[number];

function toInputValue(value?: number | null) {
  return value === null || value === undefined ? "" : String(value);
}

function parseGradeValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPostedLabel(value?: string | null) {
  if (!value) return "Not posted yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GradeSheetsSection() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [items, setItems] = useState<GradeSheetRow[]>([]);
  const [canPost, setCanPost] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<GradeSheetRow | null>(null);
  const [detailRows, setDetailRows] = useState<GradeDetailRow[]>([]);
  const [gradingSystem, setGradingSystem] = useState<GradeRule[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;

    getFacultyPeriods()
      .then((payload) => {
        if (!alive) return;
        const nextPeriods = payload.periods ?? [];
        setPeriods(nextPeriods);
        const initialPeriodId = String(payload.active_period_id ?? nextPeriods[0]?.id ?? "");
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
    setLoading(true);

    getFacultyGradeSheets(Number(selectedPeriodId), true)
      .then((payload) => {
        if (!alive) return;
        setItems(payload.items ?? []);
        setCanPost(Boolean(payload.can_post));
        setCanManage(Boolean(payload.can_manage));
      })
      .catch((error) => {
        if (!alive) return;
        setItems([]);
        toast.error(error instanceof Error ? error.message : "Failed to load grade sheets.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedPeriodId]);

  useEffect(() => {
    if (!selectedSheet) return;

    let alive = true;
    setDetailLoading(true);

    getFacultyGradeSheetDetail(selectedSheet.offering_id, true)
      .then((payload) => {
        if (!alive) return;
        setDetailRows(payload.items ?? []);
        setGradingSystem(payload.grading_system ?? []);
        setCanPost(Boolean(payload.can_post));
        setCanManage(Boolean(payload.can_manage));
      })
      .catch((error) => {
        if (!alive) return;
        setDetailRows([]);
        setGradingSystem([]);
        toast.error(error instanceof Error ? error.message : "Failed to load grade sheet details.");
      })
      .finally(() => {
        if (alive) setDetailLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedSheet]);

  const postedSummary = useMemo(() => {
    const totalRows = items.reduce((sum, item) => sum + item.total_rows, 0);
    const postedRows = items.reduce((sum, item) => sum + item.posted_rows, 0);
    return { totalRows, postedRows };
  }, [items]);

  const handleGradeChange = (enrollmentId: number, field: "midterm_grade" | "final_grade" | "re_exam_grade", value: string) => {
    setDetailRows((prev) =>
      prev.map((row) =>
        row.enrollment_id === enrollmentId
          ? {
              ...row,
              [field]: parseGradeValue(value),
            }
          : row
      )
    );
  };

  const refreshSheet = async (offeringId: number) => {
    if (!selectedPeriodId) return;

    clearFacultyPeriodCache(Number(selectedPeriodId));
    const [summaryPayload, detailPayload] = await Promise.all([
      getFacultyGradeSheets(Number(selectedPeriodId), true),
      getFacultyGradeSheetDetail(offeringId, true),
    ]);

    setItems(summaryPayload.items ?? []);
    setCanPost(Boolean(summaryPayload.can_post));
    setCanManage(Boolean(summaryPayload.can_manage));
    setDetailRows(detailPayload.items ?? []);
    setGradingSystem(detailPayload.grading_system ?? []);
  };

  const handleSave = async () => {
    if (!selectedSheet) return;

    setSubmitting(true);
    try {
      await saveFacultyGradeSheet(
        selectedSheet.offering_id,
        detailRows.map((row) => ({
          enrollment_id: row.enrollment_id,
          midterm_grade: row.midterm_grade ?? null,
          final_grade: row.final_grade ?? null,
          re_exam_grade: row.re_exam_grade ?? null,
        }))
      );
      await refreshSheet(selectedSheet.offering_id);
      toast.success("Grade sheet saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save grade sheet.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePost = async () => {
    if (!selectedSheet) return;

    setSubmitting(true);
    try {
      await postFacultyGradeSheet(selectedSheet.offering_id);
      await refreshSheet(selectedSheet.offering_id);
      toast.success("Grade sheet posted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post grade sheet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Grade Sheets</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View, encode, save, and post real grade sheets for your visible faculty offerings.
        </p>
      </div>

      <DisclaimerBanner text="DISCLAIMER: Grade encoding and posting are permission-controlled. Only authorized faculty can post final grade sheets." />
      <AyTermRow
        value={selectedPeriodId}
        onChange={setSelectedPeriodId}
        periods={periods ?? []}
        disableExport
        onExport={() => toast.success("Open a grade sheet to print its current view.")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Entries</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{postedSummary.totalRows}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Posted Entries</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{postedSummary.postedRows}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">CODE</TableHead>
              <TableHead>TITLE</TableHead>
              <TableHead>SECTION</TableHead>
              <TableHead>SCHEDULE</TableHead>
              <TableHead>POSTED</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading grade sheets...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  No grade sheets found for the selected period.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow
                  key={row.offering_id}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                  onClick={() => setSelectedSheet(row)}
                >
                  <TableCell className="font-medium">{row.course_code}</TableCell>
                  <TableCell className="italic">{row.course_title}</TableCell>
                  <TableCell>{row.section_code || "-"}</TableCell>
                  <TableCell>{row.schedule_text || "TBA"}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {row.posted_rows}/{row.total_rows} rows • {formatPostedLabel(row.latest_posted_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TableViewOptions />

      <Dialog open={Boolean(selectedSheet)} onOpenChange={(open) => (!open ? setSelectedSheet(null) : null)}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grade Sheet</DialogTitle>
          </DialogHeader>

          {selectedSheet ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {selectedSheet.course_title} ({selectedSheet.section_code || "No section"})
                  </span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-1.5 h-4 w-4" />
                    PRINT
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Use your browser print dialog to save a PDF copy.")}>
                    <Download className="mr-1.5 h-4 w-4" />
                    EXPORT
                  </Button>
                  {canManage ? (
                    <Button size="sm" variant="outline" onClick={() => void handleSave()} disabled={submitting || detailLoading}>
                      {submitting ? "Saving..." : "SAVE"}
                    </Button>
                  ) : null}
                  {canPost ? (
                    <Button size="sm" onClick={() => void handlePost()} disabled={submitting || detailLoading}>
                      {submitting ? "Posting..." : "POST"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1 overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28">STUDENT NO</TableHead>
                        <TableHead>NAME</TableHead>
                        <TableHead className="w-24 text-center">MIDTERM</TableHead>
                        <TableHead className="w-24 text-center">FINAL</TableHead>
                        <TableHead className="w-24 text-center">RE-EXAM</TableHead>
                        <TableHead className="w-40">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Loading grade sheet details...
                          </TableCell>
                        </TableRow>
                      ) : detailRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            No enrolled students found for this grade sheet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailRows.map((student) => (
                          <TableRow key={student.enrollment_id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            <TableCell className="font-mono text-sm">{student.student_number || "-"}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-center">
                              <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.25"
                                value={toInputValue(student.midterm_grade)}
                                disabled={!canManage}
                                onChange={(event) => handleGradeChange(student.enrollment_id, "midterm_grade", event.target.value)}
                                className="h-9 w-20 rounded-md border border-slate-200 bg-white px-2 text-center text-sm dark:border-white/20 dark:bg-slate-950"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.25"
                                value={toInputValue(student.final_grade)}
                                disabled={!canManage}
                                onChange={(event) => handleGradeChange(student.enrollment_id, "final_grade", event.target.value)}
                                className="h-9 w-20 rounded-md border border-slate-200 bg-white px-2 text-center text-sm dark:border-white/20 dark:bg-slate-950"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.25"
                                value={toInputValue(student.re_exam_grade)}
                                disabled={!canManage}
                                onChange={(event) => handleGradeChange(student.enrollment_id, "re_exam_grade", event.target.value)}
                                className="h-9 w-20 rounded-md border border-slate-200 bg-white px-2 text-center text-sm dark:border-white/20 dark:bg-slate-950"
                              />
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                              {student.status || "draft"} • {formatPostedLabel(student.posted_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="w-full shrink-0 rounded-lg border border-slate-200 dark:border-white/10 lg:w-72">
                  <div className="border-b border-slate-200 px-3 py-2 dark:border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      GRADING SYSTEM
                    </p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800">
                        <th className="px-2 py-1.5 text-left font-semibold">GRADE</th>
                        <th className="px-2 py-1.5 text-left font-semibold">EQUIV</th>
                        <th className="px-2 py-1.5 text-left font-semibold">DESC</th>
                        <th className="px-2 py-1.5 text-left font-semibold">REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradingSystem.map((rule) => (
                        <tr key={rule.grade} className="border-b border-slate-100 last:border-b-0 dark:border-white/5">
                          <td className="px-2 py-1 font-medium">{rule.grade}</td>
                          <td className="px-2 py-1 text-slate-500 dark:text-slate-400">{rule.equiv}</td>
                          <td className="px-2 py-1 text-slate-500 dark:text-slate-400">{rule.desc}</td>
                          <td className="px-2 py-1 text-slate-500 dark:text-slate-400">{rule.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

