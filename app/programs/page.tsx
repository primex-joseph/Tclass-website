import Link from "next/link";

const programCards = [
  {
    href: "/programs/heavy-equipment",
    title: "Heavy Equipment",
    description: "Operator-focused NCII tracks for machinery handling and safety.",
  },
  {
    href: "/programs/ict-diploma",
    title: "ICT Diploma",
    description: "Three-year diploma path for technology and digital skills.",
  },
  {
    href: "/programs/housekeeping",
    title: "Housekeeping",
    description: "Hospitality and housekeeping training with TESDA-aligned outcomes.",
  },
  {
    href: "/programs/health-care",
    title: "Health Care",
    description: "Health care services and patient support competency training.",
  },
  {
    href: "/programs/scholarships",
    title: "Scholarships",
    description: "Funding opportunities under TCLASS and partner scholarship programs.",
  },
];

export default function ProgramsPage() {
  return (
    <main className="relative min-h-screen text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/92" />
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-base font-semibold tracking-wide text-blue-800 uppercase">Programs</p>
        <h1 className="mt-2 text-4xl font-bold text-blue-950">Training Programs</h1>
        <p className="mt-6 max-w-3xl text-xl text-slate-800">
          Browse program-specific pages for requirements, duration, and training focus.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programCards.map((program) => (
            <Link key={program.href} href={program.href} className="rounded-xl border border-slate-300 bg-white/95 p-6 hover:border-blue-500 hover:shadow-sm transition">
              <h2 className="text-4xl font-bold text-slate-950">{program.title}</h2>
              <p className="mt-3 text-xl text-slate-800">{program.description}</p>
              <p className="mt-4 text-blue-900 font-semibold text-lg">View details</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
