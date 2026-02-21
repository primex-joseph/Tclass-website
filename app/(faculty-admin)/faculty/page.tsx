"use client";

import { FacultyDashboardSkeleton } from "@/components/ui/loading-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Calendar, 
  MessageSquare, 
  Bell, 
  Search, 
  Menu, 
  X,
  GraduationCap,
  FileText,
  Clock,
  TrendingUp,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Send,
  Home,
  LogOut
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { AvatarActionsMenu } from "@/components/ui/avatar-actions-menu";
import { LogoutModal } from "@/components/ui/logout-modal";

// TypeScript Types
interface Class {
  id: number;
  name: string;
  students: number;
  schedule: string;
  room: string;
  status: "active" | "inactive";
  description?: string;
}

interface Quiz {
  id: number;
  title: string;
  classId: number;
  className: string;
  duration: number;
  questions: number;
  status: "draft" | "published";
  createdAt: string;
}

interface PendingGrading {
  id: number;
  title: string;
  class: string;
  submissions: number;
  total: number;
  due: string;
}

interface Submission {
  id: number;
  student: string;
  assignment: string;
  class: string;
  submitted: string;
  status: "new" | "graded" | "pending";
  score?: number;
  feedback?: string;
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  type: string;
}

interface GradeRecord {
  id: number;
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentName: string;
  score: number;
  feedback: string;
  gradedAt: string;
}

interface Message {
  id: number;
  recipients: string;
  recipientsName: string;
  subject: string;
  body: string;
  sentAt: string;
}

// Schedule mapping for display
const scheduleMap: Record<string, string> = {
  mw9: "Mon/Wed 9:00 AM",
  tt1030: "Tue/Thu 10:30 AM",
  wf1: "Wed/Fri 1:00 PM",
  mf2: "Mon/Fri 2:00 PM",
};

const classValueToName: Record<string, string> = {
  math101: "Mathematics 101",
  algebra: "Algebra II",
  calculus: "Calculus",
};

const studentValueToName: Record<string, string> = {
  maria: "Maria Santos",
  juan: "Juan Cruz",
  ana: "Ana Reyes",
  pedro: "Pedro Garcia",
};

export default function FacultyDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Loading State
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [activeFacultyTab, setActiveFacultyTab] = useState<"classes" | "grading" | "submissions">("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(5);
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [createQuizDialogOpen, setCreateQuizDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editClassDialogOpen, setEditClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form State - New Class
  const [newClassName, setNewClassName] = useState("");
  const [newClassSchedule, setNewClassSchedule] = useState("");
  const [newClassRoom, setNewClassRoom] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");

  // Form State - Edit Class
  const [editClassName, setEditClassName] = useState("");
  const [editClassSchedule, setEditClassSchedule] = useState("");
  const [editClassRoom, setEditClassRoom] = useState("");
  const [editClassDescription, setEditClassDescription] = useState("");

  // Form State - Create Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [quizClass, setQuizClass] = useState("");
  const [quizDuration, setQuizDuration] = useState("");
  const [quizQuestions, setQuizQuestions] = useState("");

  // Form State - Grade
  const [gradeStudent, setGradeStudent] = useState("");
  const [gradeAssignment, setGradeAssignment] = useState("");
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Form State - Message
  const [messageRecipients, setMessageRecipients] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");

  // Data State
  const [myClasses, setMyClasses] = useState<Class[]>([
    { id: 1, name: "Mathematics 101", students: 35, schedule: "Mon/Wed 9:00 AM", room: "Room 301", status: "active" },
    { id: 2, name: "Algebra II", students: 28, schedule: "Tue/Thu 10:30 AM", room: "Room 205", status: "active" },
    { id: 3, name: "Calculus", students: 22, schedule: "Wed/Fri 1:00 PM", room: "Room 402", status: "active" },
  ]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [pendingGrading, setPendingGrading] = useState<PendingGrading[]>([
    { id: 1, title: "Quiz #3 - Quadratic Equations", class: "Mathematics 101", submissions: 32, total: 35, due: "Today" },
    { id: 2, title: "Midterm Exam", class: "Algebra II", submissions: 28, total: 28, due: "Yesterday" },
    { id: 3, title: "Homework Set 5", class: "Calculus", submissions: 20, total: 22, due: "Tomorrow" },
  ]);

  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([
    { id: 1, student: "Maria Santos", assignment: "Quiz #3", class: "Mathematics 101", submitted: "10 mins ago", status: "new" },
    { id: 2, student: "Juan Cruz", assignment: "Quiz #3", class: "Mathematics 101", submitted: "25 mins ago", status: "new" },
    { id: 3, student: "Ana Reyes", assignment: "Midterm Exam", class: "Algebra II", submitted: "1 hour ago", status: "graded", score: 85 },
    { id: 4, student: "Pedro Garcia", assignment: "Homework Set 5", class: "Calculus", submitted: "2 hours ago", status: "pending" },
  ]);

  const announcements: Announcement[] = [
    { id: 1, title: "Department Meeting", date: "Today, 3:00 PM", type: "Meeting" },
    { id: 2, title: "Grade Submission Deadline", date: "Friday", type: "Deadline" },
    { id: 3, title: "New Curriculum Updates", date: "Yesterday", type: "Academic" },
  ];

  // Computed Stats
  const totalStudents = useMemo(() => myClasses.reduce((sum, c) => sum + c.students, 0), [myClasses]);
  const toGradeCount = useMemo(() => recentSubmissions.filter(s => s.status !== "graded").length, [recentSubmissions]);

  // Filtered Data
  const filteredClasses = useMemo(() => {
    let filtered = myClasses;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.room.toLowerCase().includes(query) ||
        c.schedule.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    return filtered;
  }, [myClasses, searchQuery, statusFilter]);

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return recentSubmissions;
    const query = searchQuery.toLowerCase();
    return recentSubmissions.filter(s => 
      s.student.toLowerCase().includes(query) || 
      s.assignment.toLowerCase().includes(query) ||
      s.class.toLowerCase().includes(query)
    );
  }, [recentSubmissions, searchQuery]);

  const normalizedMobileSearch = mobileSearchQuery.trim().toLowerCase();

  type FacultySearchResult = {
    id: string;
    label: string;
    meta: string;
    kind: "route" | "tab";
    href?: string;
    tab?: "classes" | "grading" | "submissions";
    query?: string;
  };

  const mobileSearchResults = useMemo<FacultySearchResult[]>(() => {
    if (!normalizedMobileSearch) return [];

    const routes: FacultySearchResult[] = [
      { id: "route-dashboard", label: "Dashboard", meta: "/faculty", kind: "route", href: "/faculty" },
      { id: "route-students", label: "Students", meta: "/faculty/students", kind: "route", href: "/faculty/students" },
      { id: "route-assignments", label: "Assignments", meta: "/faculty/assignments", kind: "route", href: "/faculty/assignments" },
      { id: "route-grades", label: "Grades", meta: "/faculty/grades", kind: "route", href: "/faculty/grades" },
      { id: "route-classes", label: "My Classes", meta: "/faculty/classes", kind: "route", href: "/faculty/classes" },
    ];

    const classItems: FacultySearchResult[] = myClasses.map((cls) => ({
      id: `class-${cls.id}`,
      label: cls.name,
      meta: `${cls.room} • ${cls.schedule}`,
      kind: "tab",
      tab: "classes",
      query: cls.name,
    }));

    const gradingItems: FacultySearchResult[] = pendingGrading.map((item) => ({
      id: `grading-${item.id}`,
      label: item.title,
      meta: `${item.class} • ${item.submissions}/${item.total}`,
      kind: "tab",
      tab: "grading",
      query: item.title,
    }));

    const submissionItems: FacultySearchResult[] = recentSubmissions.map((item) => ({
      id: `submission-${item.id}`,
      label: item.assignment,
      meta: `${item.student} • ${item.class}`,
      kind: "tab",
      tab: "submissions",
      query: item.assignment,
    }));

    return [...routes, ...classItems, ...gradingItems, ...submissionItems].filter((item) =>
      `${item.label} ${item.meta}`.toLowerCase().includes(normalizedMobileSearch)
    );
  }, [normalizedMobileSearch, myClasses, pendingGrading, recentSubmissions]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const classCount = filteredClasses.length;
      const submissionCount = filteredSubmissions.length;
      toast.success(`Found ${classCount} classes and ${submissionCount} submissions matching "${searchQuery}"`);
    } else {
      toast.error("Please enter a search term");
    }
  };

  const handleNotificationClick = () => {
    setNotificationCount(0);
    toast.success("All notifications marked as read");
  };

  // Create Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClass: Class = {
      id: Date.now(),
      name: newClassName,
      students: 0,
      schedule: scheduleMap[newClassSchedule] || newClassSchedule,
      room: newClassRoom,
      status: "active",
      description: newClassDescription,
    };
    
    setMyClasses(prev => [...prev, newClass]);
    toast.success(`Class "${newClassName}" created successfully!`);
    
    // Reset form
    setNewClassName("");
    setNewClassSchedule("");
    setNewClassRoom("");
    setNewClassDescription("");
    setNewClassDialogOpen(false);
  };

  // Edit Class
  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setEditClassName(classItem.name);
    setEditClassSchedule("");
    setEditClassRoom(classItem.room);
    setEditClassDescription(classItem.description || "");
    setEditClassDialogOpen(true);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    
    setMyClasses(prev => prev.map(c => 
      c.id === editingClass.id 
        ? { 
            ...c, 
            name: editClassName, 
            room: editClassRoom,
            schedule: editClassSchedule ? (scheduleMap[editClassSchedule] || editClassSchedule) : c.schedule,
            description: editClassDescription 
          }
        : c
    ));
    
    toast.success(`Class "${editClassName}" updated successfully!`);
    setEditClassDialogOpen(false);
    setEditingClass(null);
  };

  // Delete Class
  const handleDeleteClass = (classId: number, className: string) => {
    if (confirm(`Are you sure you want to delete "${className}"?`)) {
      setMyClasses(prev => prev.filter(c => c.id !== classId));
      toast.success(`Class "${className}" deleted successfully!`);
    }
  };

  // Create Quiz
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newQuiz: Quiz = {
      id: Date.now(),
      title: quizTitle,
      classId: parseInt(quizClass) || 0,
      className: classValueToName[quizClass] || quizClass,
      duration: parseInt(quizDuration) || 30,
      questions: parseInt(quizQuestions) || 10,
      status: "published",
      createdAt: new Date().toISOString(),
    };
    
    setQuizzes(prev => [...prev, newQuiz]);
    toast.success(`Quiz "${quizTitle}" created and published!`);
    
    // Reset form
    setQuizTitle("");
    setQuizClass("");
    setQuizDuration("");
    setQuizQuestions("");
    setCreateQuizDialogOpen(false);
  };

  // Grade Submission
  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGrade: GradeRecord = {
      id: Date.now(),
      studentId: gradeStudent,
      studentName: studentValueToName[gradeStudent] || gradeStudent,
      assignmentId: gradeAssignment,
      assignmentName: gradeAssignment === "quiz3" ? "Quiz #3" : gradeAssignment === "midterm" ? "Midterm Exam" : "Homework Set 5",
      score: parseInt(gradeScore) || 0,
      feedback: gradeFeedback,
      gradedAt: new Date().toISOString(),
    };
    
    setGrades(prev => [...prev, newGrade]);
    
    // Update submission status
    setRecentSubmissions(prev => prev.map(s => 
      s.student === newGrade.studentName && s.assignment === newGrade.assignmentName
        ? { ...s, status: "graded", score: newGrade.score }
        : s
    ));
    
    toast.success(`Grade saved for ${newGrade.studentName}: ${gradeScore}/100`);
    
    // Reset form
    setGradeStudent("");
    setGradeAssignment("");
    setGradeScore("");
    setGradeFeedback("");
    setGradeDialogOpen(false);
  };

  const handleGradeItem = (id: number) => {
    const item = pendingGrading.find(g => g.id === id);
    if (item) {
      toast.success(`Opening grading for: ${item.title}`);
      setGradeDialogOpen(true);
    }
  };

  // Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipientNames: Record<string, string> = {
      all: "All Students",
      math101: "Mathematics 101",
      algebra: "Algebra II",
      calculus: "Calculus",
    };
    
    const newMessage: Message = {
      id: Date.now(),
      recipients: messageRecipients,
      recipientsName: recipientNames[messageRecipients] || messageRecipients,
      subject: messageSubject,
      body: messageBody,
      sentAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    toast.success(`Message "${messageSubject}" sent to ${newMessage.recipientsName}!`);
    
    // Reset form
    setMessageRecipients("");
    setMessageSubject("");
    setMessageBody("");
    setMessageDialogOpen(false);
  };

  // Submission Actions
  const handleSubmissionAction = (id: number, action: "graded" | "accepted" | "rejected" | "returned") => {
    setRecentSubmissions(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = action === "graded" ? "graded" : action === "accepted" ? "graded" : "pending";
        return { ...s, status: newStatus };
      }
      return s;
    }));
    
    const actionMessages: Record<string, string> = {
      graded: "Submission graded successfully",
      accepted: "Submission accepted",
      rejected: "Submission returned for revision",
      returned: "Submission returned to student",
    };
    
    toast.success(actionMessages[action] || `Submission ${action}`);
  };

  const handleViewSchedule = () => {
    toast.success("Opening full schedule view...");
    setScheduleDialogOpen(false);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    toast.success("Filters cleared");
  };

  const closeMobileOverlays = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setMobileSearchQuery("");
  };

  const openMobileRoute = (href: string) => {
    closeMobileOverlays();
    router.push(href);
  };

  const setFacultyTabFromMobile = (tab: "classes" | "grading" | "submissions") => {
    setActiveFacultyTab(tab);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    if (pathname !== "/faculty") {
      router.push("/faculty");
    }
  };

  const handleMobileSearchSelect = (item: FacultySearchResult) => {
    if (item.kind === "route" && item.href) {
      openMobileRoute(item.href);
      return;
    }

    if (item.tab) {
      setActiveFacultyTab(item.tab);
      if (item.query) {
        setSearchQuery(item.query);
      }
      setMobileSearchOpen(false);
      setMobileSearchQuery("");
    }
  };

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    document.cookie = "tclass_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "tclass_role=; path=/; max-age=0; samesite=lax";
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (mobileMenuOpen || mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, mobileSearchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen && !mobileSearchOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileOverlays();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, mobileSearchOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) {
        closeMobileOverlays();
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <FacultyDashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page faculty-page min-h-screen bg-slate-50 dark:bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_8px_20px_rgba(15,23,42,0.05)] backdrop-blur-md dark:border-white/12 dark:bg-slate-950/95 dark:shadow-[0_8px_22px_rgba(0,0,0,0.45)]">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4 py-2">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 p-2 shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">TClass</span>
              <Badge className="hidden xl:inline-flex border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:border-blue-300/30 dark:bg-blue-500/20 dark:text-blue-200">Faculty Portal</Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-2 xl:gap-3 flex-1 min-w-0 mx-4 xl:mx-6">
              <Link href="/faculty" className="nav-chip nav-chip-active">Dashboard</Link>
              <Link href="/faculty/classes" className="nav-chip">My Classes</Link>
              <Link href="/faculty/students" className="nav-chip">Students</Link>
              <Link href="/faculty/assignments" className="nav-chip">Assignments</Link>
              <Link href="/faculty/grades" className="nav-chip">Grades</Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              <form onSubmit={handleSearch} className="relative hidden lg:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search classes, submissions..." 
                    className="w-44 lg:w-48 xl:w-56 2xl:w-64 rounded-full border-slate-200 bg-slate-50/90 pl-9 text-slate-700 placeholder:text-slate-500 focus-visible:bg-white dark:border-white/15 dark:bg-slate-900/85 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:bg-slate-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filter Button */}
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Status Filter</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </form>

              {!mobileMenuOpen && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-full border border-transparent text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMobileSearchOpen(true);
                  }}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative rounded-full border border-transparent text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10" onClick={handleNotificationClick}>
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <AvatarActionsMenu
                  initials="PS"
                  onLogout={handleLogout}
                  triggerId="faculty-avatar-menu-trigger"
                  fallbackClassName="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100"
                />
              </div>
              {!mobileMenuOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setMobileMenuOpen(true);
                  }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[120] xl:hidden transition-[visibility] duration-300 ${
          mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close sidebar"
          className={`absolute inset-0 bg-slate-950/62 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Faculty mobile navigation"
          className={`absolute left-0 top-0 h-full w-[84%] max-w-[21rem] border-r border-slate-200 bg-white shadow-[0_26px_65px_rgba(15,23,42,0.32)] transition-transform duration-300 ease-out dark:border-white/15 dark:bg-slate-950 dark:shadow-[0_26px_65px_rgba(0,0,0,0.65)] ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-white/15">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 p-2 shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">TClass</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Faculty Portal</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="border-b border-slate-200 px-3 pb-3 pt-3 dark:border-white/10">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/15 dark:bg-slate-900">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Theme</span>
                <ThemeIconButton />
              </div>
            </div>

            <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
              Navigation
            </p>
            <div className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-4">
              <Link
                href="/faculty"
                onClick={closeMobileOverlays}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname === "/faculty"
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setFacultyTabFromMobile("classes")}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeFacultyTab === "classes"
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                My Classes
              </button>
              <button
                type="button"
                onClick={() => setFacultyTabFromMobile("grading")}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeFacultyTab === "grading"
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ClipboardCheck className="h-4 w-4" />
                Grading
              </button>
              <button
                type="button"
                onClick={() => setFacultyTabFromMobile("submissions")}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeFacultyTab === "submissions"
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <FileText className="h-4 w-4" />
                Submissions
              </button>
              <Link
                href="/faculty/students"
                onClick={closeMobileOverlays}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname.startsWith("/faculty/students")
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Users className="h-4 w-4" />
                Students
              </Link>
              <Link
                href="/faculty/assignments"
                onClick={closeMobileOverlays}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname.startsWith("/faculty/assignments")
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <FileText className="h-4 w-4" />
                Assignments
              </Link>
              <Link
                href="/faculty/grades"
                onClick={closeMobileOverlays}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname.startsWith("/faculty/grades")
                    ? "border-blue-500 bg-blue-600 text-white dark:border-blue-400/70 dark:bg-blue-500"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ClipboardCheck className="h-4 w-4" />
                Grades
              </Link>
            </div>

            <div className="border-t border-slate-200 p-3 dark:border-white/15">
              <button
                onClick={() => {
                  closeMobileOverlays();
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>
      </div>

      <Dialog
        open={mobileSearchOpen}
        onOpenChange={(open) => {
          setMobileSearchOpen(open);
          if (!open) {
            setMobileSearchQuery("");
          }
        }}
      >
        <DialogContent className="flex h-[62vh] min-h-[24rem] w-[95vw] max-w-xl flex-col overflow-hidden border border-blue-200/70 bg-white p-0 shadow-2xl dark:border-blue-900/70 dark:bg-slate-950">
          <DialogHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-4 dark:border-blue-900/40 dark:from-blue-950/45 dark:to-cyan-950/30">
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              Find classes, grading items, and faculty pages quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoFocus
                value={mobileSearchQuery}
                onChange={(event) => setMobileSearchQuery(event.target.value)}
                placeholder="Search anything..."
                className="h-11 rounded-xl border-slate-300 bg-slate-50 pl-9 text-slate-900 dark:border-white/20 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFacultyTabFromMobile("classes");
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Classes
              </button>
              <button
                type="button"
                onClick={() => {
                  setFacultyTabFromMobile("grading");
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Grading
              </button>
              <button
                type="button"
                onClick={() => {
                  setFacultyTabFromMobile("submissions");
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Submissions
              </button>
              <button
                type="button"
                onClick={() => openMobileRoute("/faculty/students")}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Students
              </button>
              <button
                type="button"
                onClick={() => openMobileRoute("/faculty/assignments")}
                className="col-span-2 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Assignments
              </button>
            </div>

            <div className="flex-1 min-h-[11rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-900/50">
              {normalizedMobileSearch ? (
                mobileSearchResults.length > 0 ? (
                  <div className="max-h-[10.5rem] space-y-1 overflow-y-auto pr-1">
                    {mobileSearchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMobileSearchSelect(item)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.meta}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-4 text-sm text-slate-600 dark:text-slate-300">
                    No matches found for &quot;{mobileSearchQuery}&quot;.
                  </p>
                )
              ) : (
                <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                  Search results will appear here.
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setMobileSearchOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pt-8 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back, Prof. Santos!</h1>
          <p className="text-slate-600 mt-1">Manage your classes and track student progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.02em] text-slate-600">Active Classes</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{myClasses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.02em] text-slate-600">Students</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                  <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.02em] text-slate-600">To Grade</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{toGradeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.02em] text-slate-600">Pass Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quizzes Summary (if any) */}
        {quizzes.length > 0 && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Quizzes ({quizzes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quizzes.slice(-3).map((quiz) => (
                    <div key={quiz.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-medium text-slate-900">{quiz.title}</h4>
                      <p className="text-sm text-slate-600">{quiz.className}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{quiz.questions} questions</Badge>
                        <Badge variant="outline">{quiz.duration} min</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeFacultyTab}
              onValueChange={(value) => setActiveFacultyTab(value as "classes" | "grading" | "submissions")}
              className="w-full"
            >
              <TabsList className="hidden h-auto w-full grid-cols-3 gap-1 p-1 md:grid">
                <TabsTrigger value="classes" className="min-h-9 px-2 text-[11px] font-medium sm:text-sm">My Classes</TabsTrigger>
                <TabsTrigger value="grading" className="min-h-9 px-2 text-[11px] font-medium sm:text-sm">Grading</TabsTrigger>
                <TabsTrigger value="submissions" className="min-h-9 px-2 text-[11px] font-medium sm:text-sm">Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="classes" className="mt-4 md:mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>My Classes</CardTitle>
                        <CardDescription>
                          {searchQuery || statusFilter !== "all" 
                            ? `Showing ${filteredClasses.length} of ${myClasses.length} classes`
                            : "Classes you're teaching this semester"
                          }
                        </CardDescription>
                      </div>
                      <Dialog open={newClassDialogOpen} onOpenChange={setNewClassDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-1" />
                            New Class
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>Set up a new class for the semester.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateClass}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="className">Class Name</Label>
                                <Input 
                                  id="className" 
                                  placeholder="e.g., Advanced Calculus" 
                                  required 
                                  value={newClassName}
                                  onChange={(e) => setNewClassName(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="schedule">Schedule</Label>
                                <Select 
                                  required 
                                  value={newClassSchedule}
                                  onValueChange={setNewClassSchedule}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select schedule" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mw9">Mon/Wed 9:00 AM</SelectItem>
                                    <SelectItem value="tt1030">Tue/Thu 10:30 AM</SelectItem>
                                    <SelectItem value="wf1">Wed/Fri 1:00 PM</SelectItem>
                                    <SelectItem value="mf2">Mon/Fri 2:00 PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="room">Room</Label>
                                <Input 
                                  id="room" 
                                  placeholder="e.g., Room 301" 
                                  required 
                                  value={newClassRoom}
                                  onChange={(e) => setNewClassRoom(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                  id="description" 
                                  placeholder="Brief description of the class..."
                                  value={newClassDescription}
                                  onChange={(e) => setNewClassDescription(e.target.value)}
                                />
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {filteredClasses.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p>No classes found matching your criteria</p>
                          {(searchQuery || statusFilter !== "all") && (
                            <Button variant="link" onClick={clearFilters} className="mt-2">
                              Clear filters
                            </Button>
                          )}
                        </div>
                      ) : (
                        filteredClasses.map((cls) => (
                          <div key={cls.id} className="flex flex-col gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-slate-900">{cls.name}</h3>
                                  <Badge variant={cls.status === "active" ? "default" : "secondary"} className="text-xs">
                                    {cls.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600">{cls.students} students • {cls.schedule}</p>
                              </div>
                            </div>
                            <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-3">
                              <Badge variant="outline">{cls.room}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toast.success(`Viewing ${cls.name} details`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClass(cls)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grading" className="mt-4 md:mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Grading</CardTitle>
                    <CardDescription>Assignments waiting for your review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {pendingGrading.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                          <p>All caught up! No pending grading.</p>
                        </div>
                      ) : (
                        pendingGrading.map((item) => (
                          <div key={item.id} className="flex flex-col gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">{item.title}</h4>
                                <p className="text-sm text-slate-600">{item.class}</p>
                              </div>
                            </div>
                            <div className="w-full text-left sm:w-auto sm:text-right">
                              <p className="text-sm font-medium text-slate-900">{item.submissions}/{item.total}</p>
                              <p className="text-xs text-slate-500">submissions</p>
                              <Badge variant={item.due === "Yesterday" ? "destructive" : "secondary"} className="mt-1">
                                {item.due}
                              </Badge>
                              <Button size="sm" className="mt-2 w-full sm:ml-2 sm:mt-0 sm:w-auto" onClick={() => handleGradeItem(item.id)}>Grade</Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="submissions" className="mt-4 md:mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>
                          {searchQuery 
                            ? `Showing ${filteredSubmissions.length} of ${recentSubmissions.length} submissions`
                            : "Latest student submissions"
                          }
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredSubmissions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p>No submissions found matching your search</p>
                        </div>
                      ) : (
                        filteredSubmissions.map((submission) => (
                          <div key={submission.id} className="flex flex-col gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-slate-100">
                                  {submission.student.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-slate-900">{submission.student}</h4>
                                <p className="text-sm text-slate-600">{submission.assignment} • {submission.class}</p>
                              </div>
                            </div>
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
                              <span className="text-sm text-slate-500">{submission.submitted}</span>
                              <Badge variant={
                                submission.status === 'new' ? 'default' : 
                                submission.status === 'graded' ? 'secondary' : 'outline'
                              }>
                                {submission.status}
                                {submission.score !== undefined && ` (${submission.score})`}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant={submission.status === 'graded' ? "outline" : "default"}>
                                    {submission.status === 'graded' ? 'Actions' : 'Grade'}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {submission.status !== 'graded' && (
                                    <DropdownMenuItem onClick={() => {
                                      setGradeStudent(submission.student.toLowerCase().replace(' ', ''));
                                      setGradeAssignment(submission.assignment.toLowerCase().includes('quiz') ? 'quiz3' : 'hw5');
                                      setGradeDialogOpen(true);
                                    }}>
                                      <ClipboardCheck className="h-4 w-4 mr-2" />
                                      Grade Now
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleSubmissionAction(submission.id, 'accepted')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSubmissionAction(submission.id, 'returned')}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Return
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleSubmissionAction(submission.id, 'rejected')}
                                    className="text-amber-600"
                                  >
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Needs Revision
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {/* Create Quiz Dialog */}
                  <Dialog open={createQuizDialogOpen} onOpenChange={setCreateQuizDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span className="text-xs">Create Quiz</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New Quiz</DialogTitle>
                        <DialogDescription>Create a quiz for your students.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateQuiz}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="quizTitle">Quiz Title</Label>
                            <Input 
                              id="quizTitle" 
                              placeholder="e.g., Quiz #4 - Chapter 5" 
                              required 
                              value={quizTitle}
                              onChange={(e) => setQuizTitle(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="quizClass">Class</Label>
                            <Select 
                              required 
                              value={quizClass}
                              onValueChange={setQuizClass}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="math101">Mathematics 101</SelectItem>
                                <SelectItem value="algebra">Algebra II</SelectItem>
                                <SelectItem value="calculus">Calculus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="quizDuration">Duration (minutes)</Label>
                            <Input 
                              id="quizDuration" 
                              type="number" 
                              placeholder="30" 
                              required 
                              value={quizDuration}
                              onChange={(e) => setQuizDuration(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="quizQuestions">Number of Questions</Label>
                            <Input 
                              id="quizQuestions" 
                              type="number" 
                              placeholder="10" 
                              required 
                              value={quizQuestions}
                              onChange={(e) => setQuizQuestions(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setCreateQuizDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Create Quiz</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Grade Dialog */}
                  <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        <span className="text-xs">Grade</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Grade Assignment</DialogTitle>
                        <DialogDescription>Review and grade student submissions.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleGradeSubmission}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Student</Label>
                            <Select 
                              required 
                              value={gradeStudent}
                              onValueChange={setGradeStudent}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select student" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="maria">Maria Santos</SelectItem>
                                <SelectItem value="juan">Juan Cruz</SelectItem>
                                <SelectItem value="ana">Ana Reyes</SelectItem>
                                <SelectItem value="pedro">Pedro Garcia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Assignment</Label>
                            <Select 
                              required 
                              value={gradeAssignment}
                              onValueChange={setGradeAssignment}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select assignment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quiz3">Quiz #3 - Quadratic Equations</SelectItem>
                                <SelectItem value="midterm">Midterm Exam</SelectItem>
                                <SelectItem value="hw5">Homework Set 5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="score">Score</Label>
                            <Input 
                              id="score" 
                              type="number" 
                              placeholder="0-100" 
                              min="0" 
                              max="100" 
                              required 
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <Textarea 
                              id="feedback" 
                              placeholder="Provide feedback to the student..."
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Save Grade</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Message Dialog */}
                  <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-xs">Message</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Send Message</DialogTitle>
                        <DialogDescription>Send a message to your students.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSendMessage}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Recipients</Label>
                            <Select 
                              required 
                              value={messageRecipients}
                              onValueChange={setMessageRecipients}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select recipients" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                <SelectItem value="math101">Mathematics 101</SelectItem>
                                <SelectItem value="algebra">Algebra II</SelectItem>
                                <SelectItem value="calculus">Calculus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="msgSubject">Subject</Label>
                            <Input 
                              id="msgSubject" 
                              placeholder="Enter message subject" 
                              required 
                              value={messageSubject}
                              onChange={(e) => setMessageSubject(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="msgBody">Message</Label>
                            <Textarea 
                              id="msgBody" 
                              placeholder="Type your message..." 
                              required 
                              value={messageBody}
                              onChange={(e) => setMessageBody(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Send Message</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Schedule Dialog */}
                  <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs">Schedule</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Teaching Schedule</DialogTitle>
                        <DialogDescription>Your weekly class schedule.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-3">
                          {myClasses.map((cls) => {
                            const isMW = cls.schedule.includes("Mon/Wed");
                            const bgColor = isMW ? "bg-indigo-50" : cls.schedule.includes("Tue/Thu") ? "bg-blue-50" : "bg-purple-50";
                            const borderColor = isMW ? "border-indigo-500" : cls.schedule.includes("Tue/Thu") ? "border-blue-500" : "border-purple-500";
                            
                            return (
                              <div key={cls.id} className={`flex gap-3 p-3 ${bgColor} rounded-lg border-l-4 ${borderColor}`}>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{cls.name}</p>
                                  <p className="text-sm text-slate-600">{cls.schedule} • {cls.room} • {cls.students} students</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Close</Button>
                        <Button onClick={handleViewSchedule}>View Full Schedule</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Department Notices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors" onClick={() => toast.success(`Opening: ${announcement.title}`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{announcement.type}</Badge>
                      </div>
                      <h4 className="font-medium text-slate-900">{announcement.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today&apos;s Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors" onClick={() => toast.success("Opening class details...")}>
                    <div className="text-center min-w-[3rem]">
                      <p className="text-xs text-slate-500">9:00</p>
                      <p className="text-xs text-slate-500">AM</p>
                    </div>
                    <div className="flex-1 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                      <p className="font-medium text-slate-900">Mathematics 101</p>
                      <p className="text-sm text-slate-600">Room 301 • 35 students</p>
                    </div>
                  </div>
                  <div className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors" onClick={() => toast.success("Opening class details...")}>
                    <div className="text-center min-w-[3rem]">
                      <p className="text-xs text-slate-500">10:30</p>
                      <p className="text-xs text-slate-500">AM</p>
                    </div>
                    <div className="flex-1 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="font-medium text-slate-900">Algebra II</p>
                      <p className="text-sm text-slate-600">Room 205 • 28 students</p>
                    </div>
                  </div>
                  <div className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors" onClick={() => toast.success("Opening class details...")}>
                    <div className="text-center min-w-[3rem]">
                      <p className="text-xs text-slate-500">1:00</p>
                      <p className="text-xs text-slate-500">PM</p>
                    </div>
                    <div className="flex-1 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="font-medium text-slate-900">Calculus</p>
                      <p className="text-sm text-slate-600">Room 402 • 22 students</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-[70] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-slate-950/92">
          <div className="grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={() => {
                router.push("/faculty");
                setActiveFacultyTab("classes");
              }}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                pathname === "/faculty" && activeFacultyTab === "classes"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <button
              type="button"
              onClick={() => setFacultyTabFromMobile("grading")}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                activeFacultyTab === "grading"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              Grade
            </button>
            <button
              type="button"
              onClick={() => setFacultyTabFromMobile("submissions")}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                activeFacultyTab === "submissions"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <FileText className="h-4 w-4" />
              Submit
            </button>
            <button
              type="button"
              onClick={() => openMobileRoute("/faculty/students")}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                pathname.startsWith("/faculty/students")
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <Users className="h-4 w-4" />
              Students
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setMobileMenuOpen(true);
              }}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                mobileMenuOpen
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Edit Class Dialog */}
      <Dialog open={editClassDialogOpen} onOpenChange={setEditClassDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEditClass}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editClassName">Class Name</Label>
                <Input 
                  id="editClassName" 
                  placeholder="e.g., Advanced Calculus" 
                  required 
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSchedule">Schedule</Label>
                <Select 
                  value={editClassSchedule}
                  onValueChange={setEditClassSchedule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new schedule (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mw9">Mon/Wed 9:00 AM</SelectItem>
                    <SelectItem value="tt1030">Tue/Thu 10:30 AM</SelectItem>
                    <SelectItem value="wf1">Wed/Fri 1:00 PM</SelectItem>
                    <SelectItem value="mf2">Mon/Fri 2:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRoom">Room</Label>
                <Input 
                  id="editRoom" 
                  placeholder="e.g., Room 301" 
                  required 
                  value={editClassRoom}
                  onChange={(e) => setEditClassRoom(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea 
                  id="editDescription" 
                  placeholder="Brief description of the class..."
                  value={editClassDescription}
                  onChange={(e) => setEditClassDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditClassDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
