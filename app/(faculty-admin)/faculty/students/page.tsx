"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Bell, Users, ArrowLeft, Search, Mail, FileText, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  attendance: string;
  class: string;
  status: "active" | "inactive";
}

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Maria Santos", email: "maria.s@tclass.ph", grade: "A", attendance: "95%", class: "Mathematics 101", status: "active" },
    { id: 2, name: "Juan Cruz", email: "juan.c@tclass.ph", grade: "B+", attendance: "88%", class: "Mathematics 101", status: "active" },
    { id: 3, name: "Ana Reyes", email: "ana.r@tclass.ph", grade: "A-", attendance: "92%", class: "Algebra II", status: "active" },
    { id: 4, name: "Pedro Garcia", email: "pedro.g@tclass.ph", grade: "B", attendance: "85%", class: "Calculus", status: "active" },
    { id: 5, name: "Lisa Wong", email: "lisa.w@tclass.ph", grade: "A", attendance: "98%", class: "Mathematics 101", status: "active" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordsDialogOpen, setRecordsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    
    toast.success(`Email "${subject}" sent to ${selectedStudent?.name}!`);
    setEmailDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleEditStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const formData = new FormData(e.currentTarget);
    const updatedStudent: Student = {
      ...selectedStudent,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      grade: formData.get("grade") as string,
      attendance: formData.get("attendance") as string + "%",
      class: formData.get("class") as string,
    };

    setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
    toast.success(`Student "${updatedStudent.name}" updated!`);
    setEditDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    toast.success(`Student "${selectedStudent.name}" removed!`);
    setDeleteDialogOpen(false);
    setSelectedStudent(null);
  };

  const openEmailDialog = (student: Student) => {
    setSelectedStudent(student);
    setEmailDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const openRecordsDialog = (student: Student) => {
    setSelectedStudent(student);
    setRecordsDialogOpen(true);
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
              <Link href="/faculty/students" className="text-sm font-medium text-indigo-600">Students</Link>
              <Link href="/faculty/assignments" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assignments</Link>
              <Link href="/faculty/grades" className="text-sm font-medium text-slate-600 hover:text-slate-900">Grades</Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
          <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
          <p className="text-slate-600 mt-1">View and manage your students. ({filteredStudents.length} students)</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-sm text-slate-600">{student.email} • {student.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className="mb-1">Grade: {student.grade}</Badge>
                      <p className="text-xs text-slate-500">Attendance: {student.attendance}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEmailDialog(student)} title="Send Email">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openRecordsDialog(student)} title="View Records">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(student)} title="Edit Student">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(student)} title="Remove Student">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No students found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Send an email to {selectedStudent?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendEmail}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>To</Label>
                <Input value={selectedStudent?.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input name="subject" placeholder="Enter subject" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea name="message" placeholder="Type your message..." rows={4} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Send Email</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <form onSubmit={handleEditStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input name="name" defaultValue={selectedStudent.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" type="email" defaultValue={selectedStudent.email} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Class</Label>
                  <Select name="class" defaultValue={selectedStudent.class} required>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="grade">Current Grade</Label>
                    <Select name="grade" defaultValue={selectedStudent.grade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="C+">C+</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="attendance">Attendance (%)</Label>
                    <Input name="attendance" type="number" min="0" max="100" defaultValue={selectedStudent.attendance.replace('%', '')} required />
                  </div>
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
            <DialogTitle>Remove Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedStudent?.name} from your class?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteStudent}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Records Dialog */}
      <Dialog open={recordsDialogOpen} onOpenChange={setRecordsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Student Records</DialogTitle>
            <DialogDescription>Academic records for {selectedStudent?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Current Grade</p>
                <p className="text-2xl font-bold text-slate-900">{selectedStudent?.grade}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-slate-900">{selectedStudent?.attendance}</p>
              </div>
            </div>
            <h4 className="font-semibold mb-3">Recent Assignments</h4>
            <div className="space-y-2">
              {[
                { title: "Quiz #1", grade: "95%", date: "Jan 15" },
                { title: "Homework Set 1", grade: "88%", date: "Jan 10" },
                { title: "Midterm Exam", grade: "92%", date: "Jan 5" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between p-3 border rounded-lg">
                  <span>{item.title}</span>
                  <div className="flex gap-4">
                    <span className="text-slate-500">{item.date}</span>
                    <Badge>{item.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRecordsDialogOpen(false)}>Close</Button>
            <Button onClick={() => toast.success("Full transcript generated")}>Download Transcript</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
