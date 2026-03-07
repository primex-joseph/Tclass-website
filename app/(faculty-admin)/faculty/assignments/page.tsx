"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Bell, FileText, Plus, ArrowLeft, Edit, Trash2, Search, Eye, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Assignment {
  id: number;
  title: string;
  class: string;
  due: string;
  submissions: number;
  total: number;
  description?: string;
  points?: number;
}

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, title: "Quiz #3 - Quadratic Equations", class: "Mathematics 101", due: "Today", submissions: 32, total: 35, description: "Solve 10 quadratic equations", points: 100 },
    { id: 2, title: "Midterm Exam", class: "Algebra II", due: "Yesterday", submissions: 28, total: 28, description: "Comprehensive midterm exam", points: 200 },
    { id: 3, title: "Homework Set 5", class: "Calculus", due: "Tomorrow", submissions: 20, total: 22, description: "Problems from Chapter 5", points: 50 },
    { id: 4, title: "Final Project", class: "Mathematics 101", due: "Next week", submissions: 0, total: 35, description: "Research project on mathematics history", points: 150 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === "all" || assignment.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(assignments.map(a => a.class))];

  const handleCreateAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newAssignment: Assignment = {
      id: Date.now(),
      title: formData.get("title") as string,
      class: formData.get("class") as string,
      due: formData.get("due") as string,
      submissions: 0,
      total: 35,
      description: formData.get("description") as string,
      points: parseInt(formData.get("points") as string),
    };

    setAssignments([...assignments, newAssignment]);
    toast.success(`Assignment "${newAssignment.title}" created!`);
    setNewDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleEditAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const formData = new FormData(e.currentTarget);
    const updatedAssignment: Assignment = {
      ...selectedAssignment,
      title: formData.get("title") as string,
      class: formData.get("class") as string,
      due: formData.get("due") as string,
      description: formData.get("description") as string,
      points: parseInt(formData.get("points") as string),
    };

    setAssignments(assignments.map(a => a.id === selectedAssignment.id ? updatedAssignment : a));
    toast.success("Assignment updated!");
    setEditDialogOpen(false);
    setSelectedAssignment(null);
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignment) return;
    
    setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
    toast.success("Assignment deleted!");
    setDeleteDialogOpen(false);
    setSelectedAssignment(null);
  };

  const openEditDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">TClass</span>
              <Badge className="hidden sm:inline-flex bg-indigo-100 text-indigo-700">Faculty Portal</Badge>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/faculty" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link href="/faculty/classes" className="text-sm font-medium text-slate-600 hover:text-slate-900">My Classes</Link>
              <Link href="/faculty/students" className="text-sm font-medium text-slate-600 hover:text-slate-900">Students</Link>
              <Link href="/faculty/assignments" className="text-sm font-medium text-indigo-600">Assignments</Link>
              <Link href="/faculty/grades" className="text-sm font-medium text-slate-600 hover:text-slate-900">Grades</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => toast.success("No new notifications")}>
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/faculty" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
              <p className="text-slate-600 mt-1">Manage your class assignments. ({filteredAssignments.length} assignments)</p>
            </div>
            <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent hideCloseButton className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>Create a new assignment for your students.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAssignment}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input name="title" placeholder="e.g., Quiz #4" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="class">Class</Label>
                      <Select name="class" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics 101">Mathematics 101</SelectItem>
                          <SelectItem value="Algebra II">Algebra II</SelectItem>
                          <SelectItem value="Calculus">Calculus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="due">Due Date</Label>
                      <Input name="due" placeholder="e.g., Tomorrow, Next week" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="points">Points</Label>
                      <Input name="points" type="number" placeholder="100" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea name="description" placeholder="Assignment details..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setNewDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Assignment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                      <p className="text-sm text-slate-600">{assignment.class} • {assignment.points} points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={assignment.due === "Yesterday" ? "destructive" : "secondary"}>{assignment.due}</Badge>
                      <p className="text-sm text-slate-500 mt-1">{assignment.submissions}/{assignment.total} submitted</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openViewDialog(assignment)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(assignment)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(assignment)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No assignments found</p>
            </div>
          )}
        </div>
      </main>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>Assignment Details</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Class</p>
                <p className="font-medium">{selectedAssignment?.class}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Due Date</p>
                <p className="font-medium">{selectedAssignment?.due}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Points</p>
                <p className="font-medium">{selectedAssignment?.points}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Submissions</p>
                <p className="font-medium">{selectedAssignment?.submissions}/{selectedAssignment?.total}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Description</p>
              <p className="text-sm">{selectedAssignment?.description || "No description provided."}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => toast.success(`Opening submissions for ${selectedAssignment?.title}`)}>View Submissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>Update assignment details.</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <form onSubmit={handleEditAssignment}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input name="title" defaultValue={selectedAssignment.title} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Class</Label>
                  <Select name="class" defaultValue={selectedAssignment.class} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics 101">Mathematics 101</SelectItem>
                      <SelectItem value="Algebra II">Algebra II</SelectItem>
                      <SelectItem value="Calculus">Calculus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due">Due Date</Label>
                  <Input name="due" defaultValue={selectedAssignment.due} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="points">Points</Label>
                  <Input name="points" type="number" defaultValue={selectedAssignment.points} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" defaultValue={selectedAssignment.description} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedAssignment?.title}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteAssignment}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
