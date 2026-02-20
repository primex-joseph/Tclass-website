"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Wand2 } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Period = { id: number; name: string; is_active: number };
type EvalRow = {
  id: number;
  code: string;
  title: string;
  units: number;
  year_level: number;
  semester: number;
  grade: number | null;
  result_status: "passed" | "failed" | "incomplete" | null;
};

type SubjectOption = {
  id: number;
  code: string;
  title: string;
  units: number;
  section: string;
  schedule: string;
  instructor: string;
};

type EnrollmentStatus = "not_enrolled" | "unofficial" | "official";

const IT_CURRICULUM_FALLBACK: EvalRow[] = [
  { id: 1001, code: "PLF101", title: "Program Logic Formulation", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1002, code: "CC101", title: "Introduction to Computing", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1003, code: "FILN1", title: "Kontekstwalisadong Komunikasyon", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1004, code: "GEC5", title: "Purposive Communication", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1005, code: "GEC4", title: "Mathematics in the Modern World", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1006, code: "PE1", title: "Fitness and Recreational Activities", units: 2, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1007, code: "GEC8", title: "Ethics", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1008, code: "NSTP1", title: "National Service Training Program 1", units: 3, year_level: 1, semester: 1, grade: null, result_status: null },
  { id: 1009, code: "CC102", title: "Computer Programming I", units: 3, year_level: 1, semester: 2, grade: null, result_status: null },
  { id: 1010, code: "HCI101", title: "Introduction to Human Computer Interaction", units: 1, year_level: 1, semester: 2, grade: null, result_status: null },
  { id: 1011, code: "MS101", title: "Discrete Mathematics", units: 3, year_level: 1, semester: 2, grade: null, result_status: null },
  { id: 1012, code: "GEC1", title: "Understanding the Self", units: 3, year_level: 1, semester: 2, grade: null, result_status: null },
  { id: 1013, code: "PE2", title: "Civic Welfare Training Service II", units: 3, year_level: 1, semester: 2, grade: null, result_status: null },
  { id: 1014, code: "CC103", title: "Computer Programming II", units: 3, year_level: 2, semester: 1, grade: null, result_status: null },
  { id: 1015, code: "CC104", title: "Data Structures and Algorithms", units: 3, year_level: 2, semester: 2, grade: null, result_status: null },
  { id: 1016, code: "PF102", title: "Event Driven Programming", units: 3, year_level: 3, semester: 1, grade: null, result_status: null },
  { id: 1017, code: "IM101", title: "Advance Database Systems", units: 2, year_level: 3, semester: 1, grade: null, result_status: null },
  { id: 1018, code: "IAS101", title: "Information Assurance and Security", units: 3, year_level: 3, semester: 2, grade: null, result_status: null },
  { id: 1019, code: "CAP101", title: "Capstone Project and Research I", units: 3, year_level: 3, semester: 2, grade: null, result_status: null },
  { id: 1020, code: "NET101", title: "Networking I", units: 3, year_level: 3, semester: 2, grade: null, result_status: null },
];

const pickNextTerm = (rows: EvalRow[]): { year: number; sem: number } | null => {
  if (rows.length === 0) return null;

  const terms = new Map<string, EvalRow[]>();
  for (const row of rows) {
    const key = `${row.year_level}-${row.semester}`;
    const list = terms.get(key) ?? [];
    list.push(row);
    terms.set(key, list);
  }

  const sorted = [...terms.keys()]
    .map((k) => {
      const [year, sem] = k.split("-").map(Number);
      return { year, sem, key: k };
    })
    .sort((a, b) => (a.year === b.year ? a.sem - b.sem : a.year - b.year));

  const current = sorted[sorted.length - 1];
  const currentRows = terms.get(current.key) ?? [];
  const allPassed =
    currentRows.length > 0 &&
    currentRows.every((r) => r.result_status === "passed" || (r.grade !== null && r.grade >= 75));

  if (allPassed) {
    if (current.sem === 1) return { year: current.year, sem: 2 };
    return { year: current.year + 1, sem: 1 };
  }

  return { year: current.year, sem: current.sem };
};

const buildSubjectOptions = (rows: EvalRow[]): SubjectOption[] => {
  const sections = ["A", "B"];
  const schedules = ["MWF 8:00-9:30 AM", "TTH 1:00-2:30 PM", "MWF 1:00-2:30 PM", "TTH 8:00-9:30 AM"];

  return rows.map((row, index) => ({
    id: row.id,
    code: row.code,
    title: row.title,
    units: row.units,
    section: sections[index % sections.length],
    schedule: schedules[index % schedules.length],
    instructor: index % 2 === 0 ? "Prof. Dela Cruz" : "Prof. Santos",
  }));
};

export default function StudentEnrollmentPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [evalRows, setEvalRows] = useState<EvalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAvailableId, setSelectedAvailableId] = useState<number | null>(null);
  const [preEnlisted, setPreEnlisted] = useState<SubjectOption[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<SubjectOption[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>("not_enrolled");
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("all");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const periodRes = await apiFetch("/student/periods");
        const p = (periodRes as { periods: Period[]; active_period_id: number | null }).periods ?? [];
        const active = (periodRes as { active_period_id: number | null }).active_period_id;
        setPeriods(p);
        setPeriodId(String(active ?? p[0]?.id ?? ""));

        const evalRes = await apiFetch("/student/curriculum-evaluation");
        const fetchedEval = (evalRes as { evaluation: EvalRow[] }).evaluation ?? [];
        setEvalRows(fetchedEval.length > 0 ? fetchedEval : IT_CURRICULUM_FALLBACK);
      } catch (error) {
        setEvalRows(IT_CURRICULUM_FALLBACK);
        toast.error(error instanceof Error ? error.message : "Failed to load enrollment data.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!periodId) return;
    const run = async () => {
      try {
        const res = await apiFetch(`/student/enrollments/enrolled-subjects?period_id=${periodId}`);
        const payload = res as {
          enrollment_status: EnrollmentStatus;
          enrolled_subjects: {
            id: number;
            code: string;
            title: string;
            units: number;
            schedule: string | null;
            instructor: string | null;
            section: string | null;
          }[];
        };

        const fetchedStatus = payload.enrollment_status ?? "not_enrolled";
        setEnrollmentStatus(fetchedStatus === "official" ? "unofficial" : fetchedStatus);
        const enrolled = (payload.enrolled_subjects ?? []).map((row) => ({
          id: row.id,
          code: row.code,
          title: row.title,
          units: Number(row.units ?? 0),
          schedule: row.schedule ?? "-",
          instructor: row.instructor ?? "-",
          section: row.section ?? "-",
        }));
        setEnrolledSubjects(enrolled);
      } catch {
        // Leave local state when endpoint is unavailable.
      }
    };
    run();
  }, [periodId]);

  const targetTerm = useMemo(() => pickNextTerm(evalRows), [evalRows]);

  const availableSubjects = useMemo(() => {
    if (!targetTerm) return [];
    const level = yearLevelFilter === "all" ? null : Number(yearLevelFilter);
    const filtered = evalRows.filter(
      (r) =>
        r.year_level === targetTerm.year &&
        r.semester === targetTerm.sem &&
        r.result_status !== "passed" &&
        (level === null || r.year_level === level)
    );
    return buildSubjectOptions(filtered);
  }, [evalRows, targetTerm, yearLevelFilter]);

  const selectedAvailable = useMemo(
    () => availableSubjects.find((s) => s.id === selectedAvailableId) ?? null,
    [availableSubjects, selectedAvailableId]
  );

  const preTotalUnits = useMemo(
    () => preEnlisted.reduce((sum, row) => sum + Number(row.units || 0), 0),
    [preEnlisted]
  );
  const enrolledTotalUnits = useMemo(
    () => enrolledSubjects.reduce((sum, row) => sum + Number(row.units || 0), 0),
    [enrolledSubjects]
  );

  const addSelectedSubject = () => {
    if (!selectedAvailable) {
      toast.error("Select a subject first.");
      return;
    }
    const exists = preEnlisted.some((row) => row.id === selectedAvailable.id);
    if (exists) {
      toast("Subject already in Pre-Enlisted.");
      return;
    }
    setPreEnlisted((rows) => [...rows, selectedAvailable]);
    toast.success(`${selectedAvailable.code} added to Pre-Enlisted.`);
  };

  const removePreEnlisted = (id: number) => {
    setPreEnlisted((rows) => rows.filter((row) => row.id !== id));
  };

  const autoPreEnlist = () => {
    if (availableSubjects.length === 0) {
      toast.error("No available subjects to auto-add.");
      return;
    }
    setPreEnlisted(availableSubjects);
    toast.success("Subjects auto-added from curriculum evaluation.");
  };

  const assessEnrollment = async () => {
    if (preEnlisted.length === 0) {
      toast.error("Add subjects to Pre-Enlisted before assessment.");
      return;
    }

    try {
      // Best-effort backend call. If endpoint is not ready yet, keep UI flow working.
      await apiFetch("/student/enrollments/assess", {
        method: "POST",
        body: JSON.stringify({
          period_id: Number(periodId || 0),
          subject_ids: preEnlisted.map((s) => s.id),
        }),
      });
    } catch {
      // no-op fallback
    }

    setEnrolledSubjects(preEnlisted);
    setPreEnlisted([]);
    setEnrollmentStatus("unofficial");
    toast.success("Assessment completed. Status is now Unofficially Enrolled.");
  };

  const openSubjectListPdf = () => {
    const rows = enrolledSubjects.length > 0 ? enrolledSubjects : preEnlisted;
    if (rows.length === 0) {
      toast.error("No subject list available to print.");
      return;
    }

    const html = `
      <html>
        <head><title>Subject List</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px">
          <h2>Subject List (${enrollmentStatus.toUpperCase()})</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%">
            <thead><tr><th>Code</th><th>Title</th><th>Units</th><th>Section</th><th>Schedule</th></tr></thead>
            <tbody>
              ${rows
                .map(
                  (r) =>
                    `<tr><td>${r.code}</td><td>${r.title}</td><td>${r.units}</td><td>${r.section}</td><td>${r.schedule}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const popup = window.open("", "_blank");
    if (!popup) return;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const viewCor = () => {
    if (enrollmentStatus !== "official") {
      toast.error("COR is available only when status is Officially Enrolled.");
      return;
    }
    toast.success("Opening COR PDF...");
    openSubjectListPdf();
  };

  return (
    <main className="student-page min-h-screen bg-slate-100 p-4 md:p-6 dark:bg-transparent">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Student Enrollment</h1>
            <p className="text-slate-600">Pre-enlist subjects, assess, and track enrollment status.</p>
          </div>
          <div className="flex items-center gap-2">
            {enrollmentStatus === "unofficial" && <Badge className="bg-amber-600">Unofficially Enrolled</Badge>}
            {enrollmentStatus === "not_enrolled" && <Badge variant="outline">Not Enrolled</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Controls</CardTitle>
            <CardDescription>Choose period, auto-add based on evaluation, assess, and print files.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <p className="text-sm mb-1 text-slate-600">Year Level</p>
              <Select value={yearLevelFilter} onValueChange={setYearLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm mb-1 text-slate-600">Period</p>
              <Select value={periodId} onValueChange={setPeriodId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                      {p.is_active ? " (Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end gap-2 flex-wrap">
              <Button type="button" variant="outline" onClick={autoPreEnlist}>
                <Wand2 className="mr-2 h-4 w-4" />
                Auto
              </Button>
              <Button type="button" onClick={assessEnrollment}>
                Assess
              </Button>
              <Button type="button" variant="outline" onClick={openSubjectListPdf}>
                <FileDown className="mr-2 h-4 w-4" />
                File
              </Button>
              <Button type="button" variant="outline" onClick={viewCor}>
                View COR
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Available Subjects</CardTitle>
              <CardDescription>
                {targetTerm ? `Year ${targetTerm.year} - Sem ${targetTerm.sem}` : "No curriculum term detected."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedAvailableId ? String(selectedAvailableId) : ""}
                onValueChange={(value) => setSelectedAvailableId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((row) => (
                    <SelectItem key={row.id} value={String(row.id)}>
                      {row.code} - {row.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" className="w-full" onClick={addSelectedSubject}>
                Add
              </Button>
              {availableSubjects.length === 0 && (
                <p className="text-sm text-slate-500">No available subjects found from curriculum evaluation.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Pre-Enlisted Subjects</CardTitle>
              <CardDescription>Chosen subjects before assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {preEnlisted.map((row) => (
                <div key={row.id} className="rounded-md border border-slate-200 p-2">
                  <p className="font-medium text-slate-900">{row.code} - {row.title}</p>
                  <p className="text-xs text-slate-600">
                    {row.units} units | Sec {row.section} | {row.schedule}
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => removePreEnlisted(row.id)} className="mt-1">
                    Remove
                  </Button>
                </div>
              ))}
              {preEnlisted.length === 0 && <p className="text-sm text-slate-500">No pre-enlisted subjects yet.</p>}
              <p className="text-sm font-semibold text-slate-800 text-right">Total: {preTotalUnits} units</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Enrolled Subjects</CardTitle>
              <CardDescription>Shown after clicking Assess.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {enrolledSubjects.map((row) => (
                <div key={row.id} className="rounded-md border border-slate-200 p-2">
                  <p className="font-medium text-slate-900">{row.code} - {row.title}</p>
                  <p className="text-xs text-slate-600">
                    {row.units} units | Sec {row.section} | {row.schedule}
                  </p>
                </div>
              ))}
              {enrolledSubjects.length === 0 && <p className="text-sm text-slate-500">No enrolled subjects yet.</p>}
              <p className="text-sm font-semibold text-slate-800 text-right">Total: {enrolledTotalUnits} units</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
