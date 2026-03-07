"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  GraduationCap, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ArrowLeft,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  Send,
  Paperclip,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  courseCode: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: "pending" | "submitted" | "completed";
  type: string;
  maxPoints: number;
  attachments?: string[];
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

export default function AssignmentsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      title: "Math Problem Set #5",
      subject: "Mathematics 101",
      courseCode: "MATH101",
      description: "Solve problems 1-20 from Chapter 5. Show all your work and include step-by-step solutions.",
      dueDate: "Tomorrow",
      dueTime: "11:59 PM",
      status: "pending",
      type: "Problem Set",
      maxPoints: 100,
    },
    {
      id: 2,
      title: "Essay: Modern Poetry Analysis",
      subject: "English Literature",
      courseCode: "ENG102",
      description: "Write a 1000-word essay analyzing the themes in modern poetry. Include at least 3 cited sources.",
      dueDate: "In 3 days",
      dueTime: "5:00 PM",
      status: "pending",
      type: "Essay",
      maxPoints: 150,
    },
    {
      id: 3,
      title: "Chemistry Lab Report",
      subject: "Science Lab",
      courseCode: "SCI103",
      description: "Complete lab report for the titration experiment. Include observations, calculations, and conclusion.",
      dueDate: "Next week",
      dueTime: "1:00 PM",
      status: "completed",
      type: "Lab Report",
      maxPoints: 100,
      submittedAt: "2 days ago",
      grade: 95,
      feedback: "Excellent work! Your observations were detailed and calculations were accurate.",
    },
    {
      id: 4,
      title: "History Timeline Project",
      subject: "History",
      courseCode: "HIS104",
      description: "Create a visual timeline of major events in Philippine History from 1898-1946.",
      dueDate: "In 5 days",
      dueTime: "11:59 PM",
      status: "submitted",
      type: "Project",
      maxPoints: 200,
      submittedAt: "Yesterday",
    },
    {
      id: 5,
      title: "Python Programming Exercise",
      subject: "Computer Programming",
      courseCode: "CS101",
      description: "Complete exercises 1-10 on loops and functions. Submit your .py file.",
      dueDate: "Today",
      dueTime: "6:00 PM",
      status: "pending",
      type: "Programming",
      maxPoints: 100,
    },
    {
      id: 6,
      title: "Technical Drawing Assignment",
      subject: "Technical Drawing",
      courseCode: "TECH201",
      description: "Create a detailed technical drawing using CAD software. Follow the provided specifications.",
      dueDate: "In 2 weeks",
      dueTime: "3:00 PM",
      status: "submitted",
      type: "Drawing",
      maxPoints: 150,
      submittedAt: "3 days ago",
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"...`);
    } else {
      toast.error("Please enter a search term");
    }
  };

  const handleNotificationClick = () => {
    toast.success("All notifications marked as read");
  };

  const openSubmitDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmitDialogOpen(true);
    setSelectedFile(null);
    setComment("");
  };

  const openViewDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setAssignments(assignments.map(a => 
      a.id === selectedAssignment?.id 
        ? { ...a, status: "submitted" as const, submittedAt: "Just now" }
        : a
    ));

    toast.success(`Assignment "${selectedAssignment?.title}" submitted successfully!`);
    setSubmitDialogOpen(false);
    setSelectedFile(null);
    setComment("");
  };

  const toggleAssignmentStatus = (id: number) => {
    setAssignments(assignments.map(a => {
      if (a.id === id) {
        const newStatus = a.status === "completed" ? "pending" : "completed";
        if (newStatus === "completed") {
          toast.success("Assignment marked as completed");
        } else {
          toast.success("Assignment marked as pending");
        }
        return { ...a, status: newStatus as "pending" | "completed" | "submitted" };
      }
      return a;
    }));
  };

  const handleFileSelect = () => {
    setSelectedFile("assignment_submission.pdf");
    toast.success("File selected: assignment_submission.pdf");
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = assignments.filter(a => a.status === "pending").length;
  const submittedCount = assignments.filter(a => a.status === "submitted").length;
  const completedCount = assignments.filter(a => a.status === "completed").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Submitted</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "submitted":
        return <Send className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">TClass</span>
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">Student Portal</Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/student" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link href="/student/courses" className="text-sm font-medium text-slate-600 hover:text-slate-900">Courses</Link>
              <Link href="/student/assignments" className="text-sm font-medium text-blue-600">Assignments</Link>
              <Link href="/student/grades" className="text-sm font-medium text-slate-600 hover:text-slate-900">Grades</Link>
              <Link href="/student/calendar" className="text-sm font-medium text-slate-600 hover:text-slate-900">Calendar</Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
              <Avatar className="hidden sm:flex">
                <AvatarFallback className="bg-blue-100 text-blue-700">JD</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link href="/student" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Dashboard</Link>
              <Link href="/student/courses" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Courses</Link>
              <Link href="/student/assignments" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50">Assignments</Link>
              <Link href="/student/grades" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Grades</Link>
              <Link href="/student/calendar" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Calendar</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link & Title */}
        <div className="mb-8">
          <Link href="/student" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-600 mt-1">Manage your assignments and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Submitted</p>
                  <p className="text-2xl font-bold text-slate-900">{submittedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment List</CardTitle>
            <CardDescription>{filteredAssignments.length} assignments found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAssignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      assignment.status === 'completed' ? 'bg-green-100' : 
                      assignment.status === 'submitted' ? 'bg-blue-100' : 'bg-amber-100'
                    }`}>
                      {getStatusIcon(assignment.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                      <p className="text-sm text-slate-600">{assignment.subject} • {assignment.type}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {assignment.dueDate} at {assignment.dueTime}
                        </span>
                        <span className="text-xs text-slate-500">{assignment.maxPoints} points</span>
                      </div>
                      {assignment.grade !== undefined && (
                        <Badge className="mt-2 bg-green-100 text-green-700">Grade: {assignment.grade}/{assignment.maxPoints}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    {getStatusBadge(assignment.status)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openViewDialog(assignment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {assignment.status === "pending" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSubmitDialog(assignment)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleAssignmentStatus(assignment.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      </>
                    )}
                    {assignment.status === "submitted" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleAssignmentStatus(assignment.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {assignment.status === "completed" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleAssignmentStatus(assignment.id)}
                      >
                        <RotateCcw className="h-4 w-4 text-slate-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredAssignments.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No assignments found</h3>
                  <p className="text-slate-600">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Assignment Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent hideCloseButton className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Submit Assignment
              </DialogTitle>
              <DialogDescription>{selectedAssignment?.title}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAssignment}>
              <div className="grid gap-4 py-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Assignment</p>
                  <p className="font-medium">{selectedAssignment?.title}</p>
                  <p className="text-sm text-slate-600">{selectedAssignment?.subject}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Upload File</Label>
                  <div 
                    className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={handleFileSelect}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div className="text-left">
                          <p className="text-sm text-green-600 font-medium">{selectedFile}</p>
                          <p className="text-xs text-slate-500">Click to change file</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Comments (Optional)</Label>
                  <Textarea 
                    id="comment" 
                    placeholder="Add any comments for your instructor..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Assignment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Assignment Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Assignment Details
              </DialogTitle>
              <DialogDescription>{selectedAssignment?.title}</DialogDescription>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Subject</p>
                    <p className="font-medium">{selectedAssignment.subject}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-medium">{selectedAssignment.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className="font-medium">{selectedAssignment.dueDate} at {selectedAssignment.dueTime}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Points</p>
                    <p className="font-medium">{selectedAssignment.maxPoints}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Description</p>
                  <p className="text-sm">{selectedAssignment.description}</p>
                </div>
                {selectedAssignment.submittedAt && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-500">Submitted</p>
                    <p className="font-medium">{selectedAssignment.submittedAt}</p>
                  </div>
                )}
                {selectedAssignment.grade !== undefined && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-500">Grade</p>
                    <p className="font-medium text-lg">{selectedAssignment.grade} / {selectedAssignment.maxPoints}</p>
                    {selectedAssignment.feedback && (
                      <p className="text-sm text-slate-600 mt-2">
                        <span className="font-medium">Feedback:</span> {selectedAssignment.feedback}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Status:</span>
                  {getStatusBadge(selectedAssignment.status)}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedAssignment?.status === "pending" && (
                <Button onClick={() => { setViewDialogOpen(false); openSubmitDialog(selectedAssignment); }}>
                  Submit Assignment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
