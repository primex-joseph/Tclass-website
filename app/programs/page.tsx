"use client";

import { Laptop, Truck, Users } from "lucide-react";

import { ProgramCatalogPage } from "@/components/programs/program-catalog-page";

export default function ProgramsPage() {
  return (
    <ProgramCatalogPage
      type="certificate"
      eyebrowLabel="TESDA Certificates"
      heading="Certificate Programs"
      description="Browse scholarship-supported options and technical pathways. Select a program to start your journey."
      searchPlaceholder="Search programs..."
      itemLabel="Programs"
      summaryLabel="TESDA Track"
      categoryMeta={{
        "heavy-equipment": { label: "Heavy Equipment", icon: Truck },
        ict: { label: "ICT & Tech", icon: Laptop },
        services: { label: "Services", icon: Users },
      }}
      enrollPath="/vocational"
    />
  );
}
