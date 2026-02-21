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
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";

const programTabs = [
  { id: "all", label: "All Programs" },
  { id: "heavy-equipment", label: "Heavy Equipment" },
  { id: "ict", label: "ICT & Tech" },
  { id: "services", label: "Services" },
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

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<(typeof programTabs)[number]["id"]>("all");

  const filteredPrograms = useMemo(
    () =>
      activeTab === "all"
        ? programs
        : programs.filter((program) => program.category === activeTab),
    [activeTab]
  );

  return (
    <main className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/92 dark:bg-slate-950/95" />
      
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <ThemeIconButton />
        </div>
        
        <p className="text-base font-semibold tracking-wide text-blue-800 uppercase dark:text-blue-300">Programs</p>
        <h1 className="mt-2 text-4xl font-bold text-blue-950 dark:text-slate-100">Training Programs</h1>
        <p className="mt-4 max-w-3xl text-xl text-slate-800 dark:text-slate-300">
          Browse scholarship-supported options and technical pathways. Select a program to enroll.
        </p>

        <div className="mobile-tabs-scroll -mx-1 mb-8 mt-10 flex gap-2 overflow-x-auto px-1 pb-1 sm:justify-center">
          {programTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "border border-blue-100 bg-white/85 text-slate-700 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="elev-card group flex h-full flex-col overflow-hidden">
              <div className="flex h-36 items-center justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-5 sm:h-40">
                <program.icon className="h-12 w-12 text-white/90" />
                <Badge className="border border-white/35 bg-white/10 text-white">{program.slots}</Badge>
              </div>
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-200 sm:text-xl">
                  {program.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{program.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {program.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    NCII
                  </span>
                </div>
                <div className="mt-5 pt-2">
                  <Link href={`/vocational?program=${encodeURIComponent(program.title)}`}>
                    <Button className="w-full">Enroll in this track</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No programs found in this category.</p>
          </div>
        )}
      </section>
    </main>
  );
}
