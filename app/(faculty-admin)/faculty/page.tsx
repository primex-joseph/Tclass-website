"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  ClipboardCheck, 
  Calendar,
  FileText,
  Users,
  Wifi,
  FileUser,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Plus,
  MoreVertical
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";
import { LogoutModal } from "@/components/ui/logout-modal";

// Mock Data for Faculty Profile
const facultyProfile = {
  name: "Prof. Maria Santos",
  email: "maria.santos@tclass.edu",
  facultyNumber: "FAC-2024-001",
  avatar: "/tclass-logo.jpg",
  initials: "MS"
};

// Sidebar Navigation Items
const navItems = [
  {
    label: "Home",
    icon: Home,
    href: "/faculty",
    active: true
  },
  {
    label: "Class Record",
    icon: BookOpen,
    children: [
      { label: "Class Schedule", href: "/faculty/schedule", icon: Calendar },
      { label: "Class Lists", href: "/faculty/classes", icon: Users },
      { label: "Grade Sheets", href: "/faculty/grades", icon: ClipboardCheck },
    ]
  },
  {
    label: "Evaluation Results",
    icon: ClipboardCheck,
    href: "/faculty/evaluations"
  },
  {
    label: "Online Service",
    icon: FileText,
    children: [
      { label: "Online Services", href: "/faculty/online-services", icon: Settings },
      { label: "Online PDS", href: "/faculty/pds", icon: FileUser },
      { label: "Wifi Access Generator", href: "/faculty/wifi", icon: Wifi },
    ]
  },
];

// Quick Stats
const quickStats = [
  { label: "Total Classes", value: "5", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
  { label: "Total Students", value: "156", icon: Users, color: "bg-indigo-100 text-indigo-600" },
  { label: "Pending Grades", value: "23", icon: ClipboardCheck, color: "bg-amber-100 text-amber-600" },
  { label: "Messages", value: "8", icon: MessageSquare, color: "bg-green-100 text-green-600" },
];

// Today's Schedule
const todaySchedule = [
  { time: "8:00 AM", class: "Mathematics 101", room: "Room 301", students: 35 },
  { time: "10:30 AM", class: "Algebra II", room: "Room 205", students: 28 },
  { time: "1:00 PM", class: "Calculus", room: "Room 402", students: 22 },
];

// Pending Tasks
const pendingTasks = [
  { id: 1, title: "Grade Quiz #3 - Mathematics 101", type: "Grading", due: "Today", priority: "high" },
  { id: 2, title: "Submit Grade Sheets - Algebra II", type: "Submission", due: "Tomorrow", priority: "medium" },
  { id: 3, title: "Update Class List - Calculus", type: "Update", due: "This Week", priority: "low" },
];

function FacultySidebar({ 
  activeItem, 
  onNavigate,
  isOpen, 
  onClose 
}: { 
  activeItem: string;
  onNavigate: (href: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Class Record", "Online Service"]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = () => {
    document.cookie = "tclass_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "tclass_role=; path=/; max-age=0; samesite=lax";
    window.location.href = "/";
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 z-40 h-screen w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">TClass</span>
                <Badge className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Faculty</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile Card */}
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl text-white">
                    {facultyProfile.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-slate-950">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{facultyProfile.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{facultyProfile.email}</p>
              <Badge variant="outline" className="mt-2 text-xs font-medium">
                {facultyProfile.facultyNumber}
              </Badge>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
              <ThemeIconButton />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.label)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          expandedItems.includes(item.label)
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {expandedItems.includes(item.label) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedItems.includes(item.label) && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <button
                                type="button"
                                onClick={() => onNavigate(child.href)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              >
                                <child.icon className="h-4 w-4" />
                                <span>{child.label}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => item.href && onNavigate(item.href)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        activeItem === item.label
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-sm text-white">
                  {facultyProfile.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {facultyProfile.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Faculty
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-red-600"
                onClick={() => setLogoutModalOpen(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

function FacultyContent() {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Schedule
              </CardTitle>
              <Button variant="outline" size="sm">
                View Full Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => toast.success(`Opening ${item.class} details...`)}
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.class}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.room} • {item.students} students</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                        <p className="text-sm text-slate-500">{task.type} • Due: {task.due}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => toast.success("Creating new quiz...")}>
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Create Quiz</p>
                  <p className="text-xs text-slate-500">Create a new quiz for your class</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => toast.success("Opening grade submission...")}>
                <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                <div className="text-left">
                  <p className="font-medium">Submit Grades</p>
                  <p className="text-xs text-slate-500">Submit grades for your classes</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => toast.success("Opening class lists...")}>
                <Users className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Class Lists</p>
                  <p className="text-xs text-slate-500">View and manage class rosters</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => toast.success("Sending message...")}>
                <MessageSquare className="h-5 w-5 text-amber-600" />
                <div className="text-left">
                  <p className="font-medium">Send Message</p>
                  <p className="text-xs text-slate-500">Message students or colleagues</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Badge variant="outline" className="mb-1 text-xs">Meeting</Badge>
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Faculty Meeting - Friday 3PM</p>
                  <p className="text-xs text-slate-500 mt-1">Don&apos;t forget to attend the monthly faculty meeting</p>
                </div>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Badge variant="outline" className="mb-1 text-xs">Deadline</Badge>
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Grade Submission Due</p>
                  <p className="text-xs text-slate-500 mt-1">Submit all grades by end of this week</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1 text-xs">Update</Badge>
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">New System Features</p>
                  <p className="text-xs text-slate-500 mt-1">Check out the new online services portal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FacultyDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("Home");
  const [notificationCount] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigate = (href: string) => {
    setSidebarOpen(false);
    router.push(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"...`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 lg:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">TClass</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">3</span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-sm text-white">
                MS
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <FacultySidebar 
        activeItem={activeNavItem}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar (Desktop) */}
        <header className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-16 lg:items-center lg:justify-between lg:border-b lg:border-slate-200 lg:bg-white lg:px-6 dark:border-slate-800 dark:bg-slate-950">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search classes, students, assignments..."
              className="pl-10 bg-slate-50 dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-sm text-white">
                      {facultyProfile.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{facultyProfile.name}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{facultyProfile.name}</p>
                  <p className="text-sm text-slate-500">{facultyProfile.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/faculty/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {/* Welcome Section */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, Prof. Santos!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Here&apos;s what&apos;s happening with your classes today.
            </p>
          </div>

          {/* Faculty Content */}
          <FacultyContent />
        </main>
      </div>
    </div>
  );
}
