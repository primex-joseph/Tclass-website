"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  School,
  Trash2,
  Edit,
  Loader2,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

// Types
interface UserItem {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Faculty" | "Admin";
  status: "active" | "pending" | "inactive";
  joined: string;
}

interface BackendUserItem {
  id?: number;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  status?: string;
  student_number?: string | null;
  created_at?: string;
}

interface Department {
  id: number;
  name: string;
  head: string;
  faculty: number;
  students: number;
  classes: number;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

interface AdmissionApplication {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  primary_course: string;
  secondary_course: string | null;
  email: string;
  application_type?: "admission" | "vocational";
  valid_id_type?: string | null;
  status: "pending" | "approved" | "rejected";
  created_user_id: number | null;
  remarks?: string | null;
  id_picture_path?: string | null;
  one_by_one_picture_path?: string | null;
  right_thumbmark_path?: string | null;
  birth_certificate_path?: string | null;
  valid_id_path?: string | null;
}

interface DashboardStats {
  students: number;
  faculty: number;
  classes: number;
  departments: number;
}

interface CourseTrend {
  course: string;
  total: number;
  colorClass: string;
  yearLevels: {
    year: "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
    students: number;
  }[];
}

interface CourseStudentsByYear {
  [year: string]: string[];
}

interface CourseStudentDirectory {
  [course: string]: CourseStudentsByYear;
}

interface VocationalStudentsByBatch {
  [batch: string]: string[];
}

interface VocationalStudentDirectory {
  [program: string]: VocationalStudentsByBatch;
}

interface VocationalTrend {
  program: string;
  total: number;
  colorClass: string;
  breakdown: {
    label: string;
    students: number;
  }[];
}

const formatJoinedTime = (dateText?: string) => {
  if (!dateText) return "just now";
  const ms = Date.now() - new Date(dateText).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const normalizeRole = (role?: string): UserItem["role"] => {
  const value = (role ?? "").toLowerCase();
  if (value.includes("admin")) return "Admin";
  if (value.includes("faculty") || value.includes("teacher")) return "Faculty";
  return "Student";
};

const normalizeStatus = (status?: string): UserItem["status"] => {
  const value = (status ?? "").toLowerCase();
  if (value === "inactive" || value === "disabled") return "inactive";
  if (value === "pending") return "pending";
  return "active";
};

const normalizeUsers = (rows: BackendUserItem[]): UserItem[] =>
  rows.map((row, index) => ({
    id: row.id ?? index + 1,
    name: row.name ?? row.full_name ?? "Unknown User",
    email: row.email ?? "No email",
    role: normalizeRole(row.role),
    status: normalizeStatus(row.status),
    joined: formatJoinedTime(row.created_at),
  }));

const extractUserRows = (payload: unknown): BackendUserItem[] => {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload)) return payload as BackendUserItem[];

  const obj = payload as Record<string, unknown>;
  const directCandidates = [obj.users, obj.data, obj.items, obj.results];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) return candidate as BackendUserItem[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as BackendUserItem[];
    }
  }

  return [];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [userRoleFilter, setUserRoleFilter] = useState<"student" | "faculty" | "admin">("student");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    head: "",
  });
  
  // Data states
  const [users, setUsers] = useState<UserItem[]>([]);
  
  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, name: "Mathematics", head: "Prof. Santos", faculty: 8, students: 320, classes: 24 },
    { id: 2, name: "Science", head: "Prof. Cruz", faculty: 10, students: 280, classes: 22 },
    { id: 3, name: "English", head: "Prof. Reyes", faculty: 6, students: 250, classes: 18 },
    { id: 4, name: "History", head: "Prof. Garcia", faculty: 5, students: 200, classes: 15 },
  ]);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "New user registration: Maria Santos", time: "2 mins ago", read: false },
    { id: 2, message: "Pending approval: Pedro Martinez", time: "30 mins ago", read: false },
    { id: 3, message: "System backup completed", time: "1 hour ago", read: true },
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    students: 0,
    faculty: 0,
    classes: 0,
    departments: 0,
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [recentCredentials, setRecentCredentials] = useState<{ fullName: string; email: string; studentNumber: string; temporaryPassword: string }[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState("users");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingAdmissionId, setRejectingAdmissionId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvingAdmissionId, setApprovingAdmissionId] = useState<number | null>(null);
  const [submittingReject, setSubmittingReject] = useState(false);
  const [courseTrendModalOpen, setCourseTrendModalOpen] = useState(false);
  const [selectedTrendCourse, setSelectedTrendCourse] = useState<CourseTrend | null>(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState<"1st Year" | "2nd Year" | "3rd Year" | "4th Year" | null>(null);
  const [vocationalModalOpen, setVocationalModalOpen] = useState(false);
  const [selectedVocational, setSelectedVocational] = useState<VocationalTrend | null>(null);
  const [selectedVocationalBatch, setSelectedVocationalBatch] = useState<string | null>(null);

  const courseTrends: CourseTrend[] = [
    {
      course: "BS Nursing",
      total: 420,
      colorClass: "bg-blue-500",
      yearLevels: [
        { year: "1st Year", students: 130 },
        { year: "2nd Year", students: 110 },
        { year: "3rd Year", students: 95 },
        { year: "4th Year", students: 85 },
      ],
    },
    {
      course: "BS Information Technology",
      total: 360,
      colorClass: "bg-emerald-500",
      yearLevels: [
        { year: "1st Year", students: 120 },
        { year: "2nd Year", students: 95 },
        { year: "3rd Year", students: 80 },
        { year: "4th Year", students: 65 },
      ],
    },
    {
      course: "BS Civil Engineering",
      total: 310,
      colorClass: "bg-violet-500",
      yearLevels: [
        { year: "1st Year", students: 92 },
        { year: "2nd Year", students: 82 },
        { year: "3rd Year", students: 72 },
        { year: "4th Year", students: 64 },
      ],
    },
    {
      course: "BS Accountancy",
      total: 270,
      colorClass: "bg-amber-500",
      yearLevels: [
        { year: "1st Year", students: 84 },
        { year: "2nd Year", students: 72 },
        { year: "3rd Year", students: 61 },
        { year: "4th Year", students: 53 },
      ],
    },
  ];

  const courseStudentDirectory: CourseStudentDirectory = {
    "BS Nursing": {
      "1st Year": ["Alyssa Ramos", "John Carlo Rivera", "Mika Tan", "Patricia Gomez", "Noel Mendoza"],
      "2nd Year": ["Angelica Cruz", "Jerome Garcia", "Mia Santos", "Rachel Flores", "Lea Bautista"],
      "3rd Year": ["Karen Dela Cruz", "Mark Villanueva", "Sophia Lim", "Chloe Reyes", "Lloyd Javier"],
      "4th Year": ["Hazel Navarro", "Paolo Dizon", "Tricia Mendoza", "Vince Mercado", "Shane Aquino"],
    },
    "BS Information Technology": {
      "1st Year": ["Kevin Torres", "Neil Castro", "Aaron Magno", "Jessa Pangan", "Janelle Ong"],
      "2nd Year": ["Daniel Yap", "Princess Diaz", "Kim Alonzo", "Ralph Espino", "Mae Salazar"],
      "3rd Year": ["Franco Dela Rosa", "Eunice Tolentino", "Bryan Ramos", "Ivy Caballero", "Sean Velasco"],
      "4th Year": ["Kyle David", "Rica Morales", "Nico Javier", "Alexa Cruz", "Pauline Chua"],
    },
    "BS Civil Engineering": {
      "1st Year": ["Joshua Aguilar", "Ian Simeon", "Paula Mendoza", "Nica Robles", "Warren Uy"],
      "2nd Year": ["Justine Go", "Rica Manalo", "Lance Mejia", "Bea Cordero", "Renz Domingo"],
      "3rd Year": ["Ariane Lacson", "Miguel Tolentino", "Raine Cabrera", "Noah de Leon", "Jude Salonga"],
      "4th Year": ["Tristan Laurel", "Megan Zafra", "Carlo Simbulan", "Nina Esteban", "Alden Santos"],
    },
    "BS Accountancy": {
      "1st Year": ["Aileen Pineda", "Krizelle Ramos", "Ethan Castillo", "Ralph Tiu", "Jam Ortega"],
      "2nd Year": ["Meryl Pascual", "Eli Cortez", "Camille Ventura", "Jon Santos", "Liza Fajardo"],
      "3rd Year": ["Sophia Dizon", "Troy Abad", "Mina Arcilla", "Faye Navarro", "Nash Bautista"],
      "4th Year": ["Paige Montero", "Harvey Ocampo", "Trina Serrano", "Rico Valencia", "Jules Pangan"],
    },
  };

  const vocationalStudentDirectory: VocationalStudentDirectory = {
    "Forklift NCII": {
      "Batch A": ["Miguel Ramos", "Jayson Cruz", "Mark Dela Pena", "John Velasco", "Ariel Aquino"],
      "Batch B": ["Carlo Reyes", "Nathan Salazar", "Jude Flores", "Lance Castro", "Edwin Javier"],
      "Batch C": ["Paolo Garcia", "Noel Mariano", "Clyde Mendoza", "Troy Santos", "Renz Cabrera"],
      "Batch D": ["Ethan Lim", "Vince Gonzales", "Bryan Mercado", "Shane Rivera", "Kurt Domingo"],
    },
    "Housekeeping NCII": {
      "Batch A": ["Mae Ramos", "Joy Tan", "Kylie Gomez", "Patricia Cruz", "Andrea Flores"],
      "Batch B": ["Hazel Dizon", "Lea Pangan", "Mica Uy", "Rica Torres", "Claire Navarro"],
      "Batch C": ["Alyssa Santos", "Mina Bautista", "Jessa Robles", "Nina David", "Faye Ocampo"],
      "Batch D": ["Trina Mercado", "Paige Montero", "Camille Ventura", "Liza Fajardo", "Bea Cordero"],
    },
    "Health Care Services NCII": {
      "Batch A": ["Sophia Lim", "Rachel Aquino", "Karen Dela Cruz", "Angelica Cruz", "Mia Santos"],
      "Batch B": ["Eunice Tolentino", "Janelle Ong", "Alexa Cruz", "Pauline Chua", "Rica Morales"],
      "Batch C": ["Megan Zafra", "Nica Robles", "Raine Cabrera", "Ariane Lacson", "Nina Esteban"],
      "Batch D": ["Tricia Mendoza", "Lea Bautista", "Meryl Pascual", "Faye Navarro", "Jam Ortega"],
    },
  };

  const vocationalTrends: VocationalTrend[] = [
    {
      program: "Forklift NCII",
      total: 96,
      colorClass: "bg-cyan-500",
      breakdown: [
        { label: "Batch A", students: 28 },
        { label: "Batch B", students: 24 },
        { label: "Batch C", students: 22 },
        { label: "Batch D", students: 22 },
      ],
    },
    {
      program: "Housekeeping NCII",
      total: 84,
      colorClass: "bg-emerald-500",
      breakdown: [
        { label: "Batch A", students: 22 },
        { label: "Batch B", students: 21 },
        { label: "Batch C", students: 20 },
        { label: "Batch D", students: 21 },
      ],
    },
    {
      program: "Health Care Services NCII",
      total: 78,
      colorClass: "bg-violet-500",
      breakdown: [
        { label: "Batch A", students: 19 },
        { label: "Batch B", students: 20 },
        { label: "Batch C", students: 20 },
        { label: "Batch D", students: 19 },
      ],
    },
  ];

  const loadAdmissions = async () => {
    try {
      const response = await apiFetch("/admin/admissions");
      const rows = (response as { applications?: AdmissionApplication[] }).applications ?? [];
      setAdmissions(rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load admissions.");
    }
  };

  useEffect(() => {
    let alive = true;
    apiFetch("/admin/admissions")
      .then((response) => {
        if (!alive) return;
        const rows = (response as { applications?: AdmissionApplication[] }).applications ?? [];
        setAdmissions(rows);
      })
      .catch((error) => {
        if (!alive) return;
        toast.error(error instanceof Error ? error.message : "Failed to load admissions.");
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    apiFetch("/admin/dashboard-stats")
      .then((response) => {
        if (!alive) return;
        const payload = response as Partial<DashboardStats>;
        setDashboardStats({
          students: Number(payload.students ?? 0),
          faculty: Number(payload.faculty ?? 0),
          classes: Number(payload.classes ?? 0),
          departments: Number(payload.departments ?? 0),
        });
      })
      .catch(() => {
        if (!alive) return;
        setDashboardStats({ students: 0, faculty: 0, classes: 0, departments: 0 });
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const candidates = [`/admin/users?role=${userRoleFilter}`, "/admin/users"];
        let loaded: UserItem[] = [];
        for (const path of candidates) {
          try {
            const response = await apiFetch(path);
            const rows = extractUserRows(response);
            if (rows.length > 0) {
              if (path === "/admin/users") {
                const filteredByRole = rows.filter((row) => {
                  const role = (row.role ?? "").toLowerCase();
                  return role === userRoleFilter;
                });
                loaded = normalizeUsers(filteredByRole);
              } else {
                loaded = normalizeUsers(rows);
              }
              break;
            }
          } catch {
            continue;
          }
        }
        if (!alive) return;
        setUsers(loaded);
      } catch {
        if (!alive) return;
        setUsers([]);
      } finally {
        if (alive) setLoadingUsers(false);
      }
    };
    fetchUsers();
    return () => {
      alive = false;
    };
  }, [userRoleFilter]);

  const stats = {
    totalStudents: dashboardStats.students,
    totalFaculty: dashboardStats.faculty,
    totalClasses: dashboardStats.classes,
    totalDepartments: dashboardStats.departments,
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setEditUserOpen(false);
    setSelectedUser(null);
    toast.success("User updated successfully");
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setDeleteConfirmOpen(false);
    toast.success(`User "${selectedUser.name}" deleted successfully`);
    setSelectedUser(null);
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.head) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const dept: Department = {
      id: departments.length + 1,
      ...newDepartment,
      faculty: 0,
      students: 0,
      classes: 0,
    };
    
    setDepartments([...departments, dept]);
    setNewDepartment({ name: "", head: "" });
    setAddDepartmentOpen(false);
    toast.success(`Department "${dept.name}" added successfully`);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
    toast.success("All notifications cleared");
  };

  const handleNavClick = (section: string) => {
    toast(`Navigating to ${section}...`, { icon: "🔗" });
  };
  const handleLogout = () => {
    document.cookie = "tclass_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "tclass_role=; path=/; max-age=0; samesite=lax";
    toast.success("Logged out successfully.");
    router.push("/login");
    router.refresh();
  };
  const openEditDialog = (user: UserItem) => {
    setSelectedUser({ ...user });
    setEditUserOpen(true);
  };

  const openDeleteDialog = (user: UserItem) => {
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingAdmissions = admissions.filter((item) => item.status === "pending" && (item.application_type ?? "admission") === "admission");
  const pendingVocationals = admissions.filter((item) => item.status === "pending" && (item.application_type ?? "admission") === "vocational");

  const handleApproveAdmission = async (id: number) => {
    setApprovingAdmissionId(id);
    try {
      const response = await apiFetch(`/admin/admissions/${id}/approve`, { method: "POST" });
      const preview = (response as { credentials_preview?: { student_number: string; temporary_password: string }; message?: string }).credentials_preview;
      const approved = admissions.find((a) => a.id === id);
      if (preview && approved) {
        setRecentCredentials((rows) => [
          {
            fullName: approved.full_name,
            email: approved.email,
            studentNumber: preview.student_number,
            temporaryPassword: preview.temporary_password,
          },
          ...rows,
        ]);
      }
      toast.success((response as { message?: string }).message ?? "Admission approved.");
      await loadAdmissions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve admission.");
    } finally {
      setApprovingAdmissionId(null);
    }
  };

  const openRejectAdmissionModal = (id: number) => {
    setRejectingAdmissionId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleRejectAdmission = async () => {
    if (!rejectingAdmissionId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setSubmittingReject(true);
    try {
      const response = await apiFetch(`/admin/admissions/${rejectingAdmissionId}/reject`, {
        method: "POST",
        body: JSON.stringify({ remarks: rejectionReason.trim() }),
      });
      toast.error((response as { message?: string }).message ?? "Admission rejected.");
      setRejectModalOpen(false);
      setRejectingAdmissionId(null);
      setRejectionReason("");
      await loadAdmissions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject admission.");
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div className="admin-page min-h-screen bg-slate-50 dark:bg-transparent">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-2">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <School className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">TClass</span>
              <Badge className="hidden sm:inline-flex bg-blue-100 text-blue-700 hover:bg-blue-100">Admin Portal</Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5 mx-6 flex-1">
              <a href="#" className="text-sm font-medium text-blue-600">Dashboard</a>
              <button onClick={() => handleNavClick("Users")} className="text-sm font-medium text-slate-600 hover:text-slate-900">Users</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Reports</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTrendCourse(courseTrends[0]);
                      setSelectedYearLevel(null);
                      setCourseTrendModalOpen(true);
                    }}
                  >
                    Course Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavClick("Vocational Reports")}>
                    Vocational Monitoring
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={() => handleNavClick("Settings")} className="text-sm font-medium text-slate-600 hover:text-slate-900">Settings</button>
              <Link href="/admin/enrollments" className="text-sm font-medium text-slate-600 hover:text-slate-900">Enrollments</Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9 w-52 lg:w-56 xl:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      <Button variant="ghost" size="sm" onClick={handleClearNotifications}>
                        Clear all
                      </Button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-slate-500">No notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-3 border-b border-slate-100 hover:bg-slate-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                            <p className="text-sm text-slate-700">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="hidden sm:flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-700">AD</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block leading-tight">
                  <p className="text-sm font-medium text-slate-900">Admin User</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="ml-1">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
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
              <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50">Dashboard</a>
              <button onClick={() => { handleNavClick("Users"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Users</button>
              <button onClick={() => { handleNavClick("Reports"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Reports</button>
              <button onClick={() => { handleNavClick("Settings"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Settings</button>
              <Link href="/admin/enrollments" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Enrollments</Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of school operations and management.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Students</p>
                  <p className="text-xl font-bold text-slate-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Faculty</p>
                  <p className="text-xl font-bold text-slate-900">{stats.totalFaculty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Classes</p>
                  <p className="text-xl font-bold text-slate-900">{stats.totalClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Departments</p>
                  <p className="text-xl font-bold text-slate-900">{stats.totalDepartments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="admissions">Admissions</TabsTrigger>
                <TabsTrigger value="vocationals">Vocationals</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle>Recent Users</CardTitle>
                      <div className="w-full sm:w-56">
                        <Select value={userRoleFilter} onValueChange={(value: "student" | "faculty" | "admin") => setUserRoleFilter(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="faculty">Faculty</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <CardDescription>
                        Showing {userRoleFilter} accounts based on selected category.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {searchQuery && (
                      <p className="text-sm text-slate-500 mb-4">
                        Showing {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                      </p>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingUsers ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                              Loading users...
                            </TableCell>
                          </TableRow>
                        ) : filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-slate-100">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-900">{user.name}</p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'Student' ? 'secondary' : 'default'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {user.status === 'active' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-500" />
                                )}
                                <span className={user.status === 'active' ? 'text-green-600' : 'text-amber-600'}>
                                  {user.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-500">{user.joined}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Departments</CardTitle>
                        <CardDescription>Academic departments overview</CardDescription>
                      </div>
                      <Dialog open={addDepartmentOpen} onOpenChange={setAddDepartmentOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Department</DialogTitle>
                            <DialogDescription>
                              Create a new academic department.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="dept-name">Department Name</Label>
                              <Input 
                                id="dept-name" 
                                placeholder="e.g., Computer Science"
                                value={newDepartment.name}
                                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dept-head">Department Head</Label>
                              <Input 
                                id="dept-head" 
                                placeholder="e.g., Prof. Smith"
                                value={newDepartment.head}
                                onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setAddDepartmentOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddDepartment}>Add Department</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departments.map((dept) => (
                        <div key={dept.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                              <p className="text-sm text-slate-600">Head: {dept.head}</p>
                            </div>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-semibold text-slate-900">{dept.faculty}</p>
                              <p className="text-slate-500">Faculty</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-slate-900">{dept.students}</p>
                              <p className="text-slate-500">Students</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-slate-900">{dept.classes}</p>
                              <p className="text-slate-500">Classes</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
<TabsContent value="admissions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Applications</CardTitle>
                    <CardDescription>Verify first-time enrollment requests, then approve or reject.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {pendingAdmissions.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-slate-600">No pending admissions right now.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingAdmissions.map((item) => (
                          <div key={item.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{item.full_name}</p>
                              <p className="text-sm text-slate-600">
                                {item.email} | Age {item.age} | {item.gender}
                              </p>
                              <p className="text-sm text-slate-600">
                                Primary: {item.primary_course} | Secondary: {item.secondary_course ?? "-"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Attachments:
                                {" "}
                                ID {item.id_picture_path ? "yes" : "no"},
                                {" "}
                                1x1 {item.one_by_one_picture_path ? "yes" : "no"},
                                {" "}
                                Thumbmark {item.right_thumbmark_path ? "yes" : "no"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveAdmission(item.id)}
                                disabled={approvingAdmissionId === item.id || submittingReject}
                              >
                                {approvingAdmissionId === item.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectAdmissionModal(item.id)}
                                disabled={approvingAdmissionId === item.id || submittingReject}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-slate-800 mb-2">Generated Credentials (Demo Email Queue)</p>
                      <div className="space-y-2">
                        {recentCredentials.slice(0, 5).map((item, index) => (
                          <div key={`${item.email}-${index}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                            <span className="font-semibold">{item.fullName}</span> | {item.email} | USERNAME: <span className="font-mono">{item.studentNumber}</span> | TEMP PASS: <span className="font-mono">{item.temporaryPassword}</span>
                          </div>
                        ))}
                        {recentCredentials.length === 0 && <p className="text-sm text-slate-500">No generated credentials in this session yet.</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vocationals" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vocational Enrollees</CardTitle>
                    <CardDescription>Review Training Programs & Scholarships enrollment applications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {pendingVocationals.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-slate-600">No pending vocational applications right now.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingVocationals.map((item) => (
                          <div key={item.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{item.full_name}</p>
                              <p className="text-sm text-slate-600">
                                {item.email} | Age {item.age} | {item.gender}
                              </p>
                              <p className="text-sm text-slate-600">
                                Program: {item.primary_course} | Scholarship: {item.secondary_course ?? "-"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Valid ID Type: {item.valid_id_type ?? "-"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Attachments:
                                {" "}
                                Birth Cert {item.birth_certificate_path ? "yes" : "no"},
                                {" "}
                                Valid ID {item.valid_id_path ? "yes" : "no"},
                                {" "}
                                ID Pic {item.id_picture_path ? "yes" : "no"},
                                {" "}
                                1x1 {item.one_by_one_picture_path ? "yes" : "no"},
                                {" "}
                                Thumbmark {item.right_thumbmark_path ? "yes" : "no"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveAdmission(item.id)}
                                disabled={approvingAdmissionId === item.id || submittingReject}
                              >
                                {approvingAdmissionId === item.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectAdmissionModal(item.id)}
                                disabled={approvingAdmissionId === item.id || submittingReject}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
{/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Vocational Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vocationalTrends.map((trend) => (
                    <button
                      key={trend.program}
                      type="button"
                      onClick={() => {
                        setSelectedVocational(trend);
                        setSelectedVocationalBatch(null);
                        setVocationalModalOpen(true);
                      }}
                      className="w-full text-left rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{trend.program}</span>
                        <span className="font-medium">{trend.total} trainees</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full">
                        <div className={`h-full ${trend.colorClass} rounded-full`} style={{ width: `${Math.min(100, Math.round((trend.total / 100) * 100))}%` }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Enrollment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseTrends.map((trend) => (
                    <button
                      key={trend.course}
                      type="button"
                      onClick={() => {
                        setSelectedTrendCourse(trend);
                        setSelectedYearLevel(null);
                        setCourseTrendModalOpen(true);
                      }}
                      className="w-full text-left rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{trend.course}</span>
                        <span className="font-medium">{trend.total} students</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full">
                        <div className={`h-full ${trend.colorClass} rounded-full`} style={{ width: `${Math.min(100, Math.round((trend.total / 450) * 100))}%` }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value: "Student" | "Faculty" | "Admin") => setSelectedUser({...selectedUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedUser.status} 
                  onValueChange={(value: "active" | "pending" | "inactive") => setSelectedUser({...selectedUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={courseTrendModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setCourseTrendModalOpen(true);
          }
        }}
      >
        <DialogContent
          className="border border-blue-200/80 bg-white/95 dark:border-blue-900/80 dark:bg-slate-950/95"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{selectedTrendCourse?.course ?? "Course Details"}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              {selectedYearLevel
                ? `Students in ${selectedYearLevel}`
                : "Student distribution per year level (1st to 4th year)."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedTrendCourse && !selectedYearLevel && selectedTrendCourse.yearLevels.map((row) => (
              <button
                key={row.year}
                type="button"
                onClick={() => setSelectedYearLevel(row.year)}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="text-sm text-slate-700 dark:text-slate-200">{row.year}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.students} students</span>
              </button>
            ))}
            {selectedTrendCourse && selectedYearLevel && (
              <div className="space-y-2">
                {(courseStudentDirectory[selectedTrendCourse.course]?.[selectedYearLevel] ?? []).map((student) => (
                  <div
                    key={student}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {student}
                  </div>
                ))}
              </div>
            )}
            {!selectedTrendCourse && (
              <p className="text-sm text-slate-500 dark:text-slate-300">No course selected.</p>
            )}
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            {selectedYearLevel ? (
              <Button variant="outline" onClick={() => setSelectedYearLevel(null)}>
                Back to Year Levels
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="outline"
              onClick={() => {
                setCourseTrendModalOpen(false);
                setSelectedYearLevel(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={vocationalModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setVocationalModalOpen(true);
          }
        }}
      >
        <DialogContent
          className="border border-blue-200/80 bg-white/95 dark:border-blue-900/80 dark:bg-slate-950/95"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{selectedVocational?.program ?? "Vocational Program Details"}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              {selectedVocationalBatch
                ? `Trainees in ${selectedVocationalBatch}`
                : "Batch-level trainee distribution."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedVocational && !selectedVocationalBatch && selectedVocational.breakdown.map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={() => setSelectedVocationalBatch(row.label)}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="text-sm text-slate-700 dark:text-slate-200">{row.label}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.students} trainees</span>
              </button>
            ))}
            {selectedVocational && selectedVocationalBatch && (
              <div className="space-y-2">
                {(vocationalStudentDirectory[selectedVocational.program]?.[selectedVocationalBatch] ?? []).map((student) => (
                  <div
                    key={student}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {student}
                  </div>
                ))}
              </div>
            )}
            {!selectedVocational && (
              <p className="text-sm text-slate-500 dark:text-slate-300">No program selected.</p>
            )}
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            {selectedVocationalBatch ? (
              <Button variant="outline" onClick={() => setSelectedVocationalBatch(null)}>
                Back to Batches
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="outline"
              onClick={() => {
                setVocationalModalOpen(false);
                setSelectedVocationalBatch(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Admission</DialogTitle>
            <DialogDescription>
              Provide the reason why this registration was rejected. This will be saved in the admission record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection reason</Label>
            <Textarea
              id="rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the rejection reason..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectAdmission} disabled={submittingReject}>
              {submittingReject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}









