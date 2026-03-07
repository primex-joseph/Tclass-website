"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Bell, TrendingUp, ArrowLeft, Download, FileSpreadsheet, Search, Edit, Calculator } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface GradeRecord {
  id: number;
  student: string;
  class: string;
  quiz1: number;
  quiz2: number;
  midterm: number;
  final: number;
  overall: string;
}

export default function FacultyGradesPage() {
  const [gradeData, setGradeData] = useState<GradeRecord[]>([
    { id: 1, student: "Maria Santos", class: "Mathematics 101", quiz1: 95, quiz2: 88, midterm: 92, final: 90, overall: "A" },
    { id: 2, student: "Juan Cruz", class: "Mathematics 101", quiz1: 82, quiz2: 85, midterm: 88, final: 85, overall: "B+" },
    { id: 3, student: "Ana Reyes", class: "Algebra II", quiz1: 90, quiz2: 92, midterm: 88, final: 91, overall: "A-" },
    { id: 4, student: "Pedro Garcia", class: "Calculus", quiz1: 78, quiz2: 80, midterm: 82, final: 85, overall: "B" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gradebookDialogOpen, setGradebookDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GradeRecord | null>(null);

  const filteredGrades = gradeData.filter(record => {
    const matchesSearch = record.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === "all" || record.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(gradeData.map(g => g.class))];

  // Calculate statistics
  const classAverage = filteredGrades.length > 0 
    ? (filteredGrades.reduce((acc, r) => acc + (r.quiz1 + r.quiz2 + r.midterm + r.final) / 4, 0) / filteredGrades.length).toFixed(1)
    : "0";
  
  const passRate = filteredGrades.length > 0
    ? Math.round((filteredGrades.filter(r => r.overall.startsWith('A') || r.overall.startsWith('B')).length / filteredGrades.length) * 100)
    : 0;

  const toGrade = 12; // This would be calculated from assignments

  const handleExportCSV = () => {
    const headers = ["Student", "Class", "Quiz 1", "Quiz 2", "Midterm", "Final", "Overall"];
    const rows = filteredGrades.map(g => [g.student, g.class, g.quiz1, g.quiz2, g.midterm, g.final, g.overall]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success("Grades exported to CSV!");
  };

  const handleEditGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const formData = new FormData(e.currentTarget);
    
    // Calculate overall grade based on scores
    const quiz1 = parseInt(formData.get("quiz1") as string);
    const quiz2 = parseInt(formData.get("quiz2") as string);
    const midterm = parseInt(formData.get("midterm") as string);
    const final = parseInt(formData.get("final") as string);
    const average = (quiz1 + quiz2 + midterm + final) / 4;
    
    let overall = "F";
    if (average >= 92) overall = "A";
    else if (average >= 88) overall = "A-";
    else if (average >= 85) overall = "B+";
    else if (average >= 82) overall = "B";
    else if (average >= 78) overall = "B-";
    else if (average >= 75) overall = "C+";
    else if (average >= 70) overall = "C";

    const updatedRecord: GradeRecord = {
      ...selectedRecord,
      quiz1,
      quiz2,
      midterm,
      final,
      overall,
    };

    setGradeData(gradeData.map(g => g.id === selectedRecord.id ? updatedRecord : g));
    toast.success(`Grades updated for ${selectedRecord.student}!`);
    setEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const openEditDialog = (record: GradeRecord) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  const openGradebook = () => {
    setGradebookDialogOpen(true);
  };

  const calculateOverall = (quiz1: number, quiz2: number, midterm: number, final: number) => {
    const average = (quiz1 + quiz2 + midterm + final) / 4;
    if (average >= 92) return "A";
    if (average >= 88) return "A-";
    if (average >= 85) return "B+";
    if (average >= 82) return "B";
    if (average >= 78) return "B-";
    if (average >= 75) return "C+";
    if (average >= 70) return "C";
    return "F";
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
              <Link href="/faculty/assignments" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assignments</Link>
              <Link href="/faculty/grades" className="text-sm font-medium text-indigo-600">Grades</Link>
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
              <h1 className="text-3xl font-bold text-slate-900">Grades</h1>
              <p className="text-slate-600 mt-1">View and manage student grades.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={openGradebook}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Gradebook
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Class Average</p>
                  <p className="text-xl font-bold text-slate-900">{classAverage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Pass Rate</p>
                  <p className="text-xl font-bold text-slate-900">{passRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">To Grade</p>
                  <p className="text-xl font-bold text-slate-900">{toGrade}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Students</p>
                  <p className="text-xl font-bold text-slate-900">{filteredGrades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search students..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-48">
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

        <Card>
          <CardHeader>
            <CardTitle>Grade Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-center py-3 px-4">Quiz 1</th>
                    <th className="text-center py-3 px-4">Quiz 2</th>
                    <th className="text-center py-3 px-4">Midterm</th>
                    <th className="text-center py-3 px-4">Final</th>
                    <th className="text-center py-3 px-4">Overall</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                              {row.student.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{row.student}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{row.class}</td>
                      <td className="py-3 px-4 text-center">{row.quiz1}</td>
                      <td className="py-3 px-4 text-center">{row.quiz2}</td>
                      <td className="py-3 px-4 text-center">{row.midterm}</td>
                      <td className="py-3 px-4 text-center">{row.final}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="text-lg px-3 py-1">{row.overall}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(row)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGrades.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">No grade records found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Grade Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Grades - {selectedRecord?.student}</DialogTitle>
            <DialogDescription>Update student grades.</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <form onSubmit={handleEditGrade}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quiz1">Quiz 1</Label>
                  <Input name="quiz1" type="number" min="0" max="100" defaultValue={selectedRecord.quiz1} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quiz2">Quiz 2</Label>
                  <Input name="quiz2" type="number" min="0" max="100" defaultValue={selectedRecord.quiz2} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="midterm">Midterm</Label>
                  <Input name="midterm" type="number" min="0" max="100" defaultValue={selectedRecord.midterm} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="final">Final</Label>
                  <Input name="final" type="number" min="0" max="100" defaultValue={selectedRecord.final} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Grades</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Gradebook Dialog */}
      <Dialog open={gradebookDialogOpen} onOpenChange={setGradebookDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Gradebook</DialogTitle>
            <DialogDescription>Manage all grades in one place.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {classes.map(cls => (
                <div key={cls} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">{cls}</h4>
                  <div className="space-y-2">
                    {gradeData.filter(g => g.class === cls).map(student => (
                      <div key={student.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="font-medium">{student.student}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-600">Avg: {((student.quiz1 + student.quiz2 + student.midterm + student.final) / 4).toFixed(1)}%</span>
                          <Badge>{student.overall}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setGradebookDialogOpen(false)}>Close</Button>
            <Button onClick={() => { handleExportCSV(); setGradebookDialogOpen(false); }}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
