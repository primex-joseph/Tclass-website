"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GraduationCap, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  Users,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration: string;
  location?: string;
  type: "class" | "assignment" | "exam" | "meeting" | "personal";
  color: string;
}

export default function CalendarPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 12)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [viewEventDialogOpen, setViewEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    time: string;
    duration: string;
    location: string;
    type: "class" | "assignment" | "exam" | "meeting" | "personal";
  }>({
    title: "",
    description: "",
    time: "09:00",
    duration: "1 hour",
    location: "",
    type: "class",
  });

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "Mathematics 101",
      description: "Algebra and Calculus lecture",
      date: new Date(2026, 1, 12),
      time: "9:00 AM",
      duration: "2 hours",
      location: "Room 301",
      type: "class",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Science Lab",
      description: "Chemistry experiment session",
      date: new Date(2026, 1, 12),
      time: "1:00 PM",
      duration: "2 hours",
      location: "Lab Room B",
      type: "class",
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Math Problem Set Due",
      description: "Submit Chapter 5 problems",
      date: new Date(2026, 1, 13),
      time: "11:59 PM",
      duration: "",
      type: "assignment",
      color: "bg-amber-500"
    },
    {
      id: 4,
      title: "English Literature",
      description: "Modern Poetry discussion",
      date: new Date(2026, 1, 13),
      time: "10:30 AM",
      duration: "2 hours",
      location: "Room 205",
      type: "class",
      color: "bg-purple-500"
    },
    {
      id: 5,
      title: "Computer Programming",
      description: "Python loops and functions",
      date: new Date(2026, 1, 14),
      time: "2:00 PM",
      duration: "2 hours",
      location: "Computer Lab 1",
      type: "class",
      color: "bg-cyan-500"
    },
    {
      id: 6,
      title: "Midterm Exam - Math",
      description: "Covers Chapters 1-5",
      date: new Date(2026, 1, 18),
      time: "9:00 AM",
      duration: "3 hours",
      location: "Exam Hall A",
      type: "exam",
      color: "bg-red-500"
    },
    {
      id: 7,
      title: "Group Study Session",
      description: "Review for midterms",
      date: new Date(2026, 1, 17),
      time: "3:00 PM",
      duration: "2 hours",
      location: "Library",
      type: "meeting",
      color: "bg-indigo-500"
    },
    {
      id: 8,
      title: "Technical Drawing",
      description: "CAD software practice",
      date: new Date(2026, 1, 16),
      time: "1:00 PM",
      duration: "2 hours",
      location: "Design Lab",
      type: "class",
      color: "bg-orange-500"
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

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  // Event handlers
  const openAddEventDialog = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsEditing(false);
    setSelectedEvent(null);
    setEventForm({
      title: "",
      description: "",
      time: "09:00",
      duration: "1 hour",
      location: "",
      type: "class",
    });
    setEventDialogOpen(true);
  };

  const openEditEventDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.date);
    setIsEditing(true);
    setEventForm({
      title: event.title,
      description: event.description || "",
      time: event.time,
      duration: event.duration,
      location: event.location || "",
      type: event.type,
    });
    setEventDialogOpen(true);
    setViewEventDialogOpen(false);
  };

  const openViewEventDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setViewEventDialogOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    const colorMap: Record<string, string> = {
      class: "bg-blue-500",
      assignment: "bg-amber-500",
      exam: "bg-red-500",
      meeting: "bg-indigo-500",
      personal: "bg-green-500",
    };

    if (isEditing && selectedEvent) {
      setEvents(events.map(ev => 
        ev.id === selectedEvent.id 
          ? { 
              ...ev, 
              title: eventForm.title,
              description: eventForm.description,
              time: eventForm.time,
              duration: eventForm.duration,
              location: eventForm.location,
              type: eventForm.type,
              color: colorMap[eventForm.type],
            }
          : ev
      ));
      toast.success("Event updated successfully!");
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        title: eventForm.title,
        description: eventForm.description,
        date: selectedDate || new Date(),
        time: eventForm.time,
        duration: eventForm.duration,
        location: eventForm.location,
        type: eventForm.type,
        color: colorMap[eventForm.type],
      };
      setEvents([...events, newEvent]);
      toast.success("Event added successfully!");
    }
    setEventDialogOpen(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      toast.success("Event deleted successfully!");
      setViewEventDialogOpen(false);
    }
  };

  // Calendar rendering
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 sm:h-28 border border-slate-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = isSameDay(date, new Date());

      days.push(
        <div 
          key={day} 
          className={`h-24 sm:h-28 border border-slate-100 p-1 sm:p-2 cursor-pointer hover:bg-slate-50 transition-colors ${
            isToday ? 'bg-blue-50' : ''
          }`}
          onClick={() => openAddEventDialog(date)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
              {day}
            </span>
            {isToday && <Badge className="text-[10px] px-1 py-0">Today</Badge>}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div 
                key={event.id}
                className={`${event.color} text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded truncate`}
                onClick={(e) => { e.stopPropagation(); openViewEventDialog(event); }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[10px] sm:text-xs text-slate-500 px-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'class': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'exam': return <AlertCircle className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
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
              <Link href="/student/assignments" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assignments</Link>
              <Link href="/student/grades" className="text-sm font-medium text-slate-600 hover:text-slate-900">Grades</Link>
              <Link href="/student/calendar" className="text-sm font-medium text-blue-600">Calendar</Link>
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
              <Link href="/student/assignments" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Assignments</Link>
              <Link href="/student/grades" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50">Grades</Link>
              <Link href="/student/calendar" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50">Calendar</Link>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
              <p className="text-slate-600 mt-1">Manage your schedule and events</p>
            </div>
            <Button onClick={() => openAddEventDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-bold">
                      {getMonthName(currentDate)} {currentDate.getFullYear()}
                    </h2>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={goToToday}>
                    Today
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0">
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-slate-600">Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span className="text-sm text-slate-600">Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm text-slate-600">Exam</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                <span className="text-sm text-slate-600">Meeting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-slate-600">Personal</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Next 5 events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingEvents().map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => openViewEventDialog(event)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`${event.color} p-1.5 rounded text-white mt-0.5`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-slate-500">
                            {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-slate-500">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getUpcomingEvents().length === 0 && (
                    <p className="text-center text-slate-500 py-4">No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add/Edit Event Dialog */}
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <DialogContent hideCloseButton className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                {isEditing ? 'Edit Event' : 'Add Event'}
              </DialogTitle>
              <DialogDescription>
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEvent}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter event title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select 
                    value={eventForm.type}
                    onValueChange={(value) => setEventForm({...eventForm, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input 
                      id="duration" 
                      placeholder="e.g., 1 hour"
                      value={eventForm.duration}
                      onChange={(e) => setEventForm({...eventForm, duration: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{isEditing ? 'Update Event' : 'Add Event'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Event Details Dialog */}
        <Dialog open={viewEventDialogOpen} onOpenChange={setViewEventDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={`${selectedEvent?.color} p-1.5 rounded text-white`}>
                  {selectedEvent && getEventIcon(selectedEvent.type)}
                </div>
                {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent?.type.charAt(0).toUpperCase()}{selectedEvent?.type.slice(1)}
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">
                    {selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Time</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {selectedEvent.time}
                    </p>
                  </div>
                  {selectedEvent.duration && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Duration</p>
                      <p className="font-medium">{selectedEvent.duration}</p>
                    </div>
                  )}
                </div>
                {selectedEvent.location && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedEvent.location}
                    </p>
                  </div>
                )}
                {selectedEvent.description && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Description</p>
                    <p className="text-sm">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="destructive" onClick={handleDeleteEvent}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={() => openEditEventDialog(selectedEvent!)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={() => setViewEventDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
