"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, GraduationCap, Mail, Search, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getFacultyPeriods, getFacultyStudents, type FacultyPeriodsPayload, type FacultyStudentsPayload } from "../_components/faculty-portal-cache";

type StudentItem = NonNullable<FacultyStudentsPayload["items"]>[number];

const NAV_LINKS = [
  { href: "/faculty", label: "Dashboard" },
  { href: "/faculty/classes", label: "My Classes" },
  { href: "/faculty/students", label: "Students" },
  { href: "/faculty/assignments", label: "Assignments" },
  { href: "/faculty/grades", label: "Grades" },
];

function gradeLabel(value?: number | null) {
  return value === null || value === undefined ? "-" : value.toFixed(2);
}

export default function FacultyStudentsPage() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [students, setStudents] = useState<StudentItem[]>([]);
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
          setStudents([]);
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

    getFacultyStudents(Number(selectedPeriodId), true)
      .then((payload) => {
        if (!alive) return;
        setStudents(payload.items ?? []);
      })
      .catch((error) => {
        if (!alive) return;
        setStudents([]);
        toast.error(error instanceof Error ? error.message : "Failed to load students.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedPeriodId]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      `${student.name} ${student.email} ${student.student_number} ${student.course_code} ${student.section_code}`
        .toLowerCase()
        .includes(query)
    );
  }, [students, searchQuery]);

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
                className={`text-sm font-medium ${item.href === "/faculty/students" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`}
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
            <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
            <p className="mt-1 text-slate-600">Students enrolled in your current visible offerings.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search students..." className="pl-9" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center text-sm text-slate-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-slate-500">No students found for this faculty account in the selected period.</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={`${student.user_id}-${student.course_code}-${student.section_code}`} className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {student.name.split(" ").map((chunk) => chunk[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900">{student.name}</h3>
                        <p className="text-sm text-slate-600">{student.student_number || "No student number"} • {student.course_code} {student.section_code || ""}</p>
                        <p className="mt-1 text-xs text-slate-500">{student.course_title}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
                        Midterm: <strong>{gradeLabel(student.midterm_grade)}</strong>
                      </div>
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
                        Final: <strong>{gradeLabel(student.final_grade)}</strong>
                      </div>
                      <Badge variant="secondary">{student.enrollment_status}</Badge>
                      <a href={`mailto:${student.email}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

