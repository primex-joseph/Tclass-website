"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Clock,
  HardHat,
  Laptop,
  Truck,
  Users,
  ArrowLeft,
  Search,
  GraduationCap,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";
import { ProgramsPageSkeleton } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";

const programTabs = [
  { id: "all", label: "All Programs", icon: BookOpen },
  { id: "heavy-equipment", label: "Heavy Equipment", icon: Truck },
  { id: "ict", label: "ICT & Tech", icon: Laptop },
  { id: "services", label: "Services", icon: Users },
] as const;

const programs = [
  {
    id: 1,
    title: "Rigid Highway Dump Truck NCII",
    category: "heavy-equipment",
    icon: Truck,
    description: "School-based heavy equipment training under scholarship support.",
    duration: "3 months",
    slots: "Limited slots",
  },
  {
    id: 2,
    title: "Transit Mixer NCII",
    category: "heavy-equipment",
    icon: Truck,
    description: "Concrete mixer operation training for rapid field readiness.",
    duration: "3 months",
    slots: "Now accepting",
  },
  {
    id: 3,
    title: "Forklift NCII",
    category: "heavy-equipment",
    icon: HardHat,
    description: "Practical forklift operation with competency assessments.",
    duration: "2 months",
    slots: "Open enrollment",
  },
  {
    id: 4,
    title: "3-Year Diploma in ICT",
    category: "ict",
    icon: Laptop,
    description: "Full diploma pathway for digital and IT roles.",
    duration: "3 years",
    slots: "5 slots left",
  },
  {
    id: 5,
    title: "Housekeeping NCII",
    category: "services",
    icon: Award,
    description: "Hospitality-focused housekeeping training track.",
    duration: "2 months",
    slots: "Now open",
  },
  {
    id: 6,
    title: "Health Care Services NCII",
    category: "services",
    icon: Users,
    description: "Caregiver-assistant program aligned to TESDA standards.",
    duration: "6 months",
    slots: "Limited slots",
  },
] as const;

// Category colors for visual variety
const categoryStyles: Record<string, { from: string; to: string; iconBg: string }> = {
  "heavy-equipment": { 
    from: "from-orange-600", 
    to: "to-amber-500",
    iconBg: "bg-orange-500/20"
  },
  "ict": { 
    from: "from-violet-600", 
    to: "to-purple-500",
    iconBg: "bg-violet-500/20"
  },
  "services": { 
    from: "from-emerald-600", 
    to: "to-teal-500",
    iconBg: "bg-emerald-500/20"
  },
};

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<(typeof programTabs)[number]["id"]>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change with animation
  const handleTabChange = (tabId: typeof activeTab) => {
    if (tabId === activeTab) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsAnimating(false);
    }, 150);
  };

  // Compute filtered programs before any conditional returns (hooks rule)
  const filteredPrograms = useMemo(() => {
    let filtered = activeTab === "all" 
      ? programs 
      : programs.filter((program) => program.category === activeTab);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(query) ||
          program.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: programs.length,
      filtered: filteredPrograms.length,
      categories: programTabs.length - 1, // exclude "all"
    };
  }, [filteredPrograms.length]);

  // Early return for loading state (after all hooks)
  if (loading) {
    return (
      <main className="relative min-h-screen">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/tclass.jpg')" }} />
        <div className="absolute inset-0 bg-white/92 dark:bg-slate-950/95" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <ProgramsPageSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-slate-900 dark:text-slate-100">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/92 to-white/90 dark:from-slate-950/98 dark:via-slate-950/95 dark:to-slate-950/90" />
      
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300 transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 group-hover:bg-blue-100 dark:bg-slate-800 dark:group-hover:bg-blue-500/20 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <ThemeIconButton />
        </div>
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 mb-4">
            <GraduationCap className="h-4 w-4" />
            <span>TESDA-Accredited Programs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Training Programs
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Browse scholarship-supported options and technical pathways. 
            Select a program to start your journey.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 sm:gap-10 mb-8 text-sm">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
            <p className="text-slate-500 dark:text-slate-400">Programs</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.categories}</p>
            <p className="text-slate-500 dark:text-slate-400">Categories</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">100%</p>
            <p className="text-slate-500 dark:text-slate-400">Scholarship</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm">
            {programTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30" />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-slate-100">{stats.filtered}</span> program{stats.filtered !== 1 && 's'}
          </p>
        </div>

        {/* Programs Grid */}
        <div 
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 transition-all duration-300",
            isAnimating ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"
          )}
        >
          {filteredPrograms.map((program, index) => {
            const styles = categoryStyles[program.category] || { from: "from-blue-600", to: "to-cyan-500", iconBg: "bg-blue-500/20" };
            return (
              <Card 
                key={program.id} 
                className="group relative flex h-full flex-col overflow-hidden border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Header with Gradient */}
                <div className={cn(
                  "relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br",
                  styles.from,
                  styles.to
                )}>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30" />
                    <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/20" />
                  </div>
                  
                  <div className="relative h-full flex items-center justify-between px-5 sm:px-6">
                    {/* Icon */}
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <program.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    
                    {/* Status Badge */}
                    <Badge className={cn(
                      "border border-white/30 bg-white/15 text-white backdrop-blur-sm",
                      program.slots.toLowerCase().includes('limited') && "bg-amber-500/30 border-amber-400/50"
                    )}>
                      {program.slots}
                    </Badge>
                  </div>
                  
                  {/* Bottom gradient fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Card Content */}
                <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {program.description}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="mt-4 flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {program.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-slate-400" />
                      NCII
                    </span>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="mt-5 pt-2">
                    <Link href={`/vocational?program=${encodeURIComponent(program.title)}`}>
                      <Button 
                        className={cn(
                          "w-full group/btn relative overflow-hidden rounded-xl font-semibold transition-all duration-300",
                          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        )}
                      >
                        <span className="relative flex items-center justify-center gap-2">
                          Enroll Now
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No programs found</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
        
        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 sm:p-8 shadow-xl shadow-blue-500/20">
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white">Need help choosing?</h3>
              <p className="text-blue-100 text-sm mt-1">Contact our admissions team for guidance.</p>
            </div>
            <Link href="/#send-message">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
