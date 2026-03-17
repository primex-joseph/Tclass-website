"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Download, FileSpreadsheet, GraduationCap, Search, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getFacultyGrades, getFacultyPeriods, type FacultyGradesPayload, type FacultyPeriodsPayload } from "../_components/faculty-portal-cache";

type GradeItem = NonNullable<FacultyGradesPayload["items"]>[number];

const NAV_LINKS = [
  { href: "/faculty", label: "Dashboard" },
  { href: "/faculty/classes", label: "My Classes" },
  { href: "/faculty/students", label: "Students" },
  { href: "/faculty/assignments", label: "Assignments" },
  { href: "/faculty/quizzes", label: "Quizzes" },
  { href: "/faculty/grades", label: "Grades" },
];

function numericValues(rows: GradeItem[]) {
  return rows.flatMap((row) => [row.midterm_grade, row.final_grade, row.re_exam_grade]).filter((value): value is number => typeof value === "number");
}

export default function FacultyGradesPage() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");

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
          setGrades([]);
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

    getFacultyGrades(Number(selectedPeriodId), true)
      .then((payload) => {
        if (!alive) return;
        setGrades(payload.items ?? []);
        setCanManage(Boolean(payload.can_manage));
      })
      .catch((error) => {
        if (!alive) return;
        setGrades([]);
        toast.error(error instanceof Error ? error.message : "Failed to load grades.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedPeriodId]);

  const filteredGrades = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return grades.filter((record) => {
      const matchesSearch = `${record.student_name} ${record.student_number} ${record.course_code} ${record.course_title}`.toLowerCase().includes(query);
      const matchesCourse = filterCourse === "all" || record.course_code === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [grades, filterCourse, searchQuery]);

  const courseCodes = [...new Set(grades.map((item) => item.course_code))].sort();
  const values = numericValues(filteredGrades);
  const average = values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2) : "0.00";
  const passedCount = filteredGrades.filter((row) => row.status === "posted" || ((row.re_exam_grade ?? row.final_grade ?? row.midterm_grade ?? 5) <= 3)).length;
  const passRate = filteredGrades.length ? Math.round((passedCount / filteredGrades.length) * 100) : 0;

  const exportCsv = async () => {
    try {
      const headers = ["Student", "Student Number", "Course", "Midterm", "Final", "Re-Exam", "Status"];
      const rows = filteredGrades.map((row) => [
        row.student_name,
        row.student_number,
        `${row.course_code} ${row.course_title}`,
        row.midterm_grade ?? "",
        row.final_grade ?? "",
        row.re_exam_grade ?? "",
        row.status,
      ]);
      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `faculty-grades-${selectedPeriodId}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Grades exported.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export grades.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TClass</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${item.href === "/faculty/grades" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/faculty" className="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Grades</h1>
            <p className="mt-1 text-slate-600">Live grade entries gathered from your faculty grade sheets.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedPeriodId}
              onChange={(event) => {
                setLoading(true);
                setSelectedPeriodId(event.target.value);
              }}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {periods?.map((period) => (
                <option key={period.id} value={String(period.id)}>{period.name}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => void exportCsv()}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/faculty#grade-sheets">
              <Button>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Grade Sheets
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Average Grade" value={average} tone="green" />
          <StatCard label="Pass Rate" value={`${passRate}%`} tone="blue" />
          <StatCard label="Visible Entries" value={String(filteredGrades.length)} tone="amber" />
          <StatCard label="Edit Access" value={canManage ? "Enabled" : "View Only"} tone="slate" />
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search students..." className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <select
            value={filterCourse}
            onChange={(event) => setFilterCourse(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="all">All Courses</option>
            {courseCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grade Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading grades...</div>
            ) : filteredGrades.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No grade entries found for this period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Course</th>
                      <th className="px-4 py-3 text-center">Midterm</th>
                      <th className="px-4 py-3 text-center">Final</th>
                      <th className="px-4 py-3 text-center">Re-Exam</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-indigo-100 text-xs text-indigo-700">
                                {row.student_name.split(" ").map((chunk) => chunk[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{row.student_name}</p>
                              <p className="text-xs text-slate-500">{row.student_number || "No student number"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.course_code} - {row.course_title}</td>
                        <td className="px-4 py-3 text-center">{row.midterm_grade ?? "-"}</td>
                        <td className="px-4 py-3 text-center">{row.final_grade ?? "-"}</td>
                        <td className="px-4 py-3 text-center">{row.re_exam_grade ?? "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={row.status === "posted" ? "default" : "secondary"}>{row.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "green" | "blue" | "amber" | "slate" }) {
  const tones = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  } as const;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${tones[tone]}`}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-600">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

