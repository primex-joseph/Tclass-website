"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, BookOpen, FileUp, GraduationCap, Search, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  clearFacultyPeriodCache,
  getFacultyClasses,
  getFacultyPeriods,
  uploadFacultySyllabus,
  type FacultyClassesPayload,
  type FacultyPeriodsPayload,
} from "../_components/faculty-portal-cache";

type ClassItem = NonNullable<FacultyClassesPayload["items"]>[number];

const NAV_LINKS = [
  { href: "/faculty", label: "Dashboard" },
  { href: "/faculty/classes", label: "My Classes" },
  { href: "/faculty/students", label: "Students" },
  { href: "/faculty/assignments", label: "Assignments" },
  { href: "/faculty/quizzes", label: "Quizzes" },
  { href: "/faculty/grades", label: "Grades" },
];

export default function FacultyClassesPage() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [canUploadSyllabus, setCanUploadSyllabus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);

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
          setClasses([]);
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

    getFacultyClasses(Number(selectedPeriodId), true)
      .then((payload) => {
        if (!alive) return;
        setClasses(payload.items ?? []);
        setCanUploadSyllabus(Boolean(payload.can_upload_syllabus));
      })
      .catch((error) => {
        if (!alive) return;
        setClasses([]);
        toast.error(error instanceof Error ? error.message : "Failed to load classes.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedPeriodId]);

  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((item) =>
      `${item.course_code} ${item.course_title} ${item.section_code} ${item.schedule_text} ${item.room_code}`.toLowerCase().includes(query)
    );
  }, [classes, searchQuery]);

  const handleSyllabusUpload = async (offeringId: number, file: File | null) => {
    if (!file || !selectedPeriodId) return;

    setUploadingId(offeringId);
    try {
      await uploadFacultySyllabus(offeringId, file);
      clearFacultyPeriodCache(Number(selectedPeriodId));
      const payload = await getFacultyClasses(Number(selectedPeriodId), true);
      setClasses(payload.items ?? []);
      setCanUploadSyllabus(Boolean(payload.can_upload_syllabus));
      toast.success("Syllabus uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload syllabus.");
    } finally {
      setUploadingId(null);
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
                className={`text-sm font-medium ${item.href === "/faculty/classes" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`}
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
            <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
            <p className="mt-1 text-slate-600">Live faculty offerings, linked to your schedule and syllabus records.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={selectedPeriodId}
              onChange={(event) => setSelectedPeriodId(event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {periods?.map((period) => (
                <option key={period.id} value={String(period.id)}>{period.name}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search classes..." className="pl-9" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="p-6 text-sm text-slate-500">Loading classes...</CardContent>
            </Card>
          ) : filteredClasses.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <BookOpen className="h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No faculty classes found for this period.</p>
              </CardContent>
            </Card>
          ) : (
            filteredClasses.map((cls) => (
              <Card key={cls.offering_id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cls.course_code}</CardTitle>
                        <p className="text-sm text-slate-500">{cls.course_title}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {cls.section_code || "No section"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{cls.enrolled_count} students enrolled</span>
                    </div>
                    <p>{cls.schedule_text || "Schedule pending"}</p>
                    <p>{cls.room_code || "Room TBD"}</p>
                    <p>{cls.teacher_name || "Teacher link pending"}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="font-medium text-slate-800 dark:text-slate-100">Syllabus</p>
                    {cls.syllabus ? (
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {cls.syllabus.file_name} uploaded {new Date(cls.syllabus.uploaded_at).toLocaleString("en-PH")}
                      </p>
                    ) : (
                      <p className="mt-1 text-slate-500 dark:text-slate-400">No syllabus uploaded yet.</p>
                    )}
                  </div>

                  {canUploadSyllabus ? (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                      <FileUp className="h-4 w-4" />
                      {uploadingId === cls.offering_id ? "Uploading..." : cls.syllabus ? "Replace Syllabus" : "Upload Syllabus"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        disabled={uploadingId === cls.offering_id}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          void handleSyllabusUpload(cls.offering_id, file);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <p className="text-xs text-slate-400">Syllabus upload is limited to users with instructor workflow access.</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

