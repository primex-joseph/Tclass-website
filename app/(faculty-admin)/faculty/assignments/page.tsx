"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Edit, Eye, FileText, Filter, GraduationCap, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  clearFacultyPeriodCache,
  createFacultyAssignment,
  deleteFacultyAssignment,
  getFacultyAssignments,
  getFacultyClasses,
  getFacultyPeriods,
  updateFacultyAssignment,
  type FacultyAssignmentsPayload,
  type FacultyClassesPayload,
  type FacultyPeriodsPayload,
} from "../_components/faculty-portal-cache";

type AssignmentItem = NonNullable<FacultyAssignmentsPayload["items"]>[number];
type OfferingItem = NonNullable<FacultyClassesPayload["items"]>[number];

const NAV_LINKS = [
  { href: "/faculty", label: "Dashboard" },
  { href: "/faculty/classes", label: "My Classes" },
  { href: "/faculty/students", label: "Students" },
  { href: "/faculty/assignments", label: "Assignments" },
  { href: "/faculty/grades", label: "Grades" },
];

const EMPTY_FORM = {
  offering_id: "",
  title: "",
  description: "",
  points: "100",
  due_at: "",
  is_published: true,
};

function toLocalDateTimeInput(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function FacultyAssignmentsPage() {
  const [periods, setPeriods] = useState<FacultyPeriodsPayload["periods"]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [offerings, setOfferings] = useState<OfferingItem[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    let alive = true;

    getFacultyPeriods()
      .then((payload) => {
        if (!alive) return;
        const nextPeriods = payload.periods ?? [];
        setPeriods(nextPeriods);
        setSelectedPeriodId(String(payload.active_period_id ?? nextPeriods[0]?.id ?? ""));
      })
      .catch((error) => {
        if (!alive) return;
        toast.error(error instanceof Error ? error.message : "Failed to load periods.");
      });

    return () => {
      alive = false;
    };
  }, []);

  const loadData = async (periodId: string) => {
    if (!periodId) {
      setAssignments([]);
      setOfferings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [assignmentPayload, classesPayload] = await Promise.all([
        getFacultyAssignments(Number(periodId), true),
        getFacultyClasses(Number(periodId), true),
      ]);
      setAssignments(assignmentPayload.items ?? []);
      setOfferings(classesPayload.items ?? []);
      setCanManage(Boolean(assignmentPayload.can_manage));
    } catch (error) {
      setAssignments([]);
      setOfferings([]);
      toast.error(error instanceof Error ? error.message : "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(selectedPeriodId);
  }, [selectedPeriodId]);

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesSearch = `${assignment.title} ${assignment.course_code} ${assignment.course_title} ${assignment.section_code}`
        .toLowerCase()
        .includes(query);
      const matchesClass = filterClass === "all" || String(assignment.offering_id) === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [assignments, filterClass, searchQuery]);

  const resetForm = () => setForm(EMPTY_FORM);

  const openNewDialog = () => {
    resetForm();
    setNewDialogOpen(true);
  };

  const openEditDialog = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment);
    setForm({
      offering_id: String(assignment.offering_id),
      title: assignment.title,
      description: assignment.description || "",
      points: String(assignment.points || 100),
      due_at: toLocalDateTimeInput(assignment.due_at),
      is_published: assignment.is_published,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const refreshAssignments = async () => {
    if (!selectedPeriodId) return;
    clearFacultyPeriodCache(Number(selectedPeriodId));
    await loadData(selectedPeriodId);
  };

  const handleCreateAssignment = async () => {
    setSubmitting(true);
    try {
      await createFacultyAssignment({
        offering_id: Number(form.offering_id),
        title: form.title,
        description: form.description || undefined,
        points: Number(form.points || 100),
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        is_published: form.is_published,
      });
      await refreshAssignments();
      setNewDialogOpen(false);
      resetForm();
      toast.success("Assignment created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAssignment = async () => {
    if (!selectedAssignment) return;

    setSubmitting(true);
    try {
      await updateFacultyAssignment(selectedAssignment.id, {
        title: form.title,
        description: form.description || undefined,
        points: Number(form.points || 100),
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        is_published: form.is_published,
      });
      await refreshAssignments();
      setEditDialogOpen(false);
      setSelectedAssignment(null);
      resetForm();
      toast.success("Assignment updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    setSubmitting(true);
    try {
      await deleteFacultyAssignment(selectedAssignment.id);
      await refreshAssignments();
      setDeleteDialogOpen(false);
      setSelectedAssignment(null);
      toast.success("Assignment deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete assignment.");
    } finally {
      setSubmitting(false);
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
                className={`text-sm font-medium ${item.href === "/faculty/assignments" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`}
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
            <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
            <p className="mt-1 text-slate-600">Create and manage assignments tied to your actual faculty offerings.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPeriodId}
              onChange={(event) => setSelectedPeriodId(event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {periods?.map((period) => (
                <option key={period.id} value={String(period.id)}>{period.name}</option>
              ))}
            </select>
            {canManage ? (
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search assignments..." className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filterClass}
              onChange={(event) => setFilterClass(event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900"
            >
              <option value="all">All Classes</option>
              {offerings.map((offering) => (
                <option key={offering.offering_id} value={String(offering.offering_id)}>
                  {offering.course_code} {offering.section_code || ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-sm text-slate-500">Loading assignments...</CardContent>
            </Card>
          ) : filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No assignments found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-indigo-100 p-3">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                        <p className="text-sm text-slate-600">
                          {assignment.course_code} • {assignment.section_code || "No section"} • {assignment.points} points
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <div className="text-right">
                        <Badge variant={assignment.is_published ? "default" : "secondary"}>
                          {assignment.is_published ? "Published" : "Draft"}
                        </Badge>
                        <p className="mt-1 text-sm text-slate-500">
                          Due {assignment.due_at ? new Date(assignment.due_at).toLocaleString("en-PH") : "not set"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openViewDialog(assignment)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManage ? (
                          <>
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(assignment)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(assignment)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>Assignment Details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm text-slate-700">
            <p><strong>Class:</strong> {selectedAssignment?.course_code} {selectedAssignment?.section_code}</p>
            <p><strong>Due:</strong> {selectedAssignment?.due_at ? new Date(selectedAssignment.due_at).toLocaleString("en-PH") : "Not set"}</p>
            <p><strong>Points:</strong> {selectedAssignment?.points}</p>
            <p><strong>Status:</strong> {selectedAssignment?.is_published ? "Published" : "Draft"}</p>
            <div>
              <p className="mb-1 font-medium">Description</p>
              <p>{selectedAssignment?.description || "No description provided."}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>Publish work to one of your linked class offerings.</DialogDescription>
          </DialogHeader>
          <AssignmentForm form={form} setForm={setForm} offerings={offerings} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNewDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="button" onClick={() => void handleCreateAssignment()} disabled={submitting || !form.offering_id || !form.title.trim()}>
              {submitting ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>Update assignment details for the selected offering.</DialogDescription>
          </DialogHeader>
          <AssignmentForm form={form} setForm={setForm} offerings={offerings} disableOffering />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="button" onClick={() => void handleEditAssignment()} disabled={submitting || !form.title.trim()}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>Remove {selectedAssignment?.title} from this faculty offering?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={() => void handleDeleteAssignment()} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignmentForm({
  form,
  setForm,
  offerings,
  disableOffering = false,
}: {
  form: typeof EMPTY_FORM;
  setForm: Dispatch<SetStateAction<typeof EMPTY_FORM>>;
  offerings: OfferingItem[];
  disableOffering?: boolean;
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="assignment-offering">Class</Label>
        <select
          id="assignment-offering"
          value={form.offering_id}
          disabled={disableOffering}
          onChange={(event) => setForm((prev) => ({ ...prev, offering_id: event.target.value }))}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 disabled:opacity-60"
        >
          <option value="">Select class offering</option>
          {offerings.map((offering) => (
            <option key={offering.offering_id} value={String(offering.offering_id)}>
              {offering.course_code} - {offering.course_title} ({offering.section_code || "No section"})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assignment-title">Assignment Title</Label>
        <Input id="assignment-title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assignment-due">Due Date</Label>
        <Input id="assignment-due" type="datetime-local" value={form.due_at} onChange={(event) => setForm((prev) => ({ ...prev, due_at: event.target.value }))} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assignment-points">Points</Label>
        <Input id="assignment-points" type="number" min="1" max="1000" value={form.points} onChange={(event) => setForm((prev) => ({ ...prev, points: event.target.value }))} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assignment-description">Description</Label>
        <Textarea id="assignment-description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={4} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))}
        />
        Publish immediately
      </label>
    </div>
  );
}

