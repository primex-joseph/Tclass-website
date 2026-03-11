"use client";

import { Briefcase, GraduationCap, Laptop } from "lucide-react";

import { ProgramCatalogPage } from "@/components/programs/program-catalog-page";

export default function DiplomaProgramsPage() {
  return (
    <ProgramCatalogPage
      type="diploma"
      eyebrowLabel="4-Year College Courses"
      heading="Diploma Courses"
      description="Browse scholarship-supported options and technical pathways. Select a program to start your journey."
      searchPlaceholder="Search courses..."
      itemLabel="Courses"
      summaryLabel="Degree Path"
      categoryMeta={{
        education: { label: "Education", icon: GraduationCap },
        ict: { label: "ICT & Tech", icon: Laptop },
        business: { label: "Business", icon: Briefcase },
      }}
      enrollPath="/diploma"
    />
  );
}
