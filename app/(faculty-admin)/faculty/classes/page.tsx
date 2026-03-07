"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, GraduationCap, Bell, Users, ArrowLeft, Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Class {
  id: number;
  name: string;
  students: number;
  schedule: string;
  room: string;
  status: "active" | "inactive";
  description?: string;
}

export default function FacultyClassesPage() {
  const [classes, setClasses] = useState<Class[]>([
    { id: 1, name: "Mathematics 101", students: 35, schedule: "Mon/Wed 9:00 AM", room: "Room 301", status: "active", description: "Introduction to basic mathematics" },
    { id: 2, name: "Algebra II", students: 28, schedule: "Tue/Thu 10:30 AM", room: "Room 205", status: "active", description: "Advanced algebraic concepts" },
    { id: 3, name: "Calculus", students: 22, schedule: "Wed/Fri 1:00 PM", room: "Room 402", status: "active", description: "Differential and integral calculus" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [editClassDialogOpen, setEditClassDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.schedule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newClass: Class = {
      id: Date.now(),
      name: formData.get("className") as string,
      students: 0,
      schedule: formData.get("schedule") as string,
      room: formData.get("room") as string,
      status: "active",
      description: formData.get("description") as string,
    };

    setClasses([...classes, newClass]);
    toast.success(`Class "${newClass.name}" created successfully!`);
    setNewClassDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleEditClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClass) return;

    const formData = new FormData(e.currentTarget);
    const updatedClass: Class = {
      ...selectedClass,
      name: formData.get("className") as string,
      schedule: formData.get("schedule") as string,
      room: formData.get("room") as string,
      description: formData.get("description") as string,
    };

    setClasses(classes.map(c => c.id === selectedClass.id ? updatedClass : c));
    toast.success(`Class "${updatedClass.name}" updated successfully!`);
    setEditClassDialogOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = () => {
    if (!selectedClass) return;
    
    setClasses(classes.filter(c => c.id !== selectedClass.id));
    toast.success(`Class "${selectedClass.name}" deleted successfully!`);
    setDeleteDialogOpen(false);
    setSelectedClass(null);
  };

  const openEditDialog = (cls: Class) => {
    setSelectedClass(cls);
    setEditClassDialogOpen(true);
  };

  const openDeleteDialog = (cls: Class) => {
    setSelectedClass(cls);
    setDeleteDialogOpen(true);
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
              <Link href="/faculty/classes" className="text-sm font-medium text-indigo-600">My Classes</Link>
              <Link href="/faculty/students" className="text-sm font-medium text-slate-600 hover:text-slate-900">Students</Link>
              <Link href="/faculty/assignments" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assignments</Link>
              <Link href="/faculty/grades" className="text-sm font-medium text-slate-600 hover:text-slate-900">Grades</Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search classes..." 
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
              <p className="text-slate-600 mt-1">Manage your teaching classes.</p>
            </div>
            <Dialog open={newClassDialogOpen} onOpenChange={setNewClassDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Class
                </Button>
              </DialogTrigger>
              <DialogContent hideCloseButton className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>Set up a new class for the semester.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateClass}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="className">Class Name</Label>
                      <Input name="className" placeholder="e.g., Advanced Calculus" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="schedule">Schedule</Label>
                      <Select name="schedule" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mon/Wed 9:00 AM">Mon/Wed 9:00 AM</SelectItem>
                          <SelectItem value="Tue/Thu 10:30 AM">Tue/Thu 10:30 AM</SelectItem>
                          <SelectItem value="Wed/Fri 1:00 PM">Wed/Fri 1:00 PM</SelectItem>
                          <SelectItem value="Mon/Fri 2:00 PM">Mon/Fri 2:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="room">Room</Label>
                      <Input name="room" placeholder="e.g., Room 301" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea name="description" placeholder="Brief description of the class..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setNewClassDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Class</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <Badge variant={cls.status === "active" ? "default" : "secondary"}>{cls.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(cls)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(cls)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>{cls.students} students enrolled</span>
                  </div>
                  <div className="text-sm text-slate-600">{cls.schedule}</div>
                  <div className="text-sm text-slate-600">{cls.room}</div>
                  <Button className="w-full mt-4" onClick={() => toast.success(`Viewing ${cls.name} details`)}>View Class</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No classes found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={editClassDialogOpen} onOpenChange={setEditClassDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class details.</DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <form onSubmit={handleEditClass}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input name="className" defaultValue={selectedClass.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select name="schedule" defaultValue={selectedClass.schedule} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mon/Wed 9:00 AM">Mon/Wed 9:00 AM</SelectItem>
                      <SelectItem value="Tue/Thu 10:30 AM">Tue/Thu 10:30 AM</SelectItem>
                      <SelectItem value="Wed/Fri 1:00 PM">Wed/Fri 1:00 PM</SelectItem>
                      <SelectItem value="Mon/Fri 2:00 PM">Mon/Fri 2:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room">Room</Label>
                  <Input name="room" defaultValue={selectedClass.room} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" defaultValue={selectedClass.description} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditClassDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent hideCloseButton className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedClass?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteClass}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
