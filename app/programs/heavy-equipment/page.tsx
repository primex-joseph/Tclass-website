import Link from "next/link";

export default function HeavyEquipmentPage() {
  const qualifications = [
    "At least High School or SHS Graduate/ALS passer/College level or graduate",
    "18 years old and above",
    "Physically and mentally fit",
    "Can comply with all requirements needed",
  ];

  const documentaryRequirements = [
    "High School Graduate: Photocopy of Diploma, and Certified True Copy of Form 138/137/Form 9",
    "ALS Graduate: ALS Certificate",
    "College Level/Graduate: Photocopy of Diploma, Certified True Copy of Transcript of Records, National Certificates (if applicable)",
    "PSA Birth Certificate (photocopy)",
    "PSA Marriage Certificate (for female married students)",
    "Picture in white background with collar (studio shot): 3 pcs passport size, 4 pcs 1x1",
    "Original Barangay Indigency",
    "Original Medical Certificate",
    "Voter's ID/Certification or any government-issued ID with address (photocopy)",
    "Long envelope with clear plastic envelope",
    "For driving/heavy equipment: Driver's license (original and photocopy), bring original documents for verification, and must be capable of operating a 4-wheeled vehicle",
  ];

  return (
    <main className="relative min-h-screen text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/92" />
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-blue-950">Heavy Equipment Program</h1>
        <p className="mt-6 text-xl text-slate-800 leading-relaxed">
          This track focuses on safe and efficient operation of heavy machinery, including dump trucks,
          transit mixers, and forklifts, aligned with NCII competency standards.
        </p>
        <ul className="mt-8 list-disc pl-6 text-lg text-slate-800 space-y-2">
          <li>Hands-on equipment operation and maintenance basics</li>
          <li>Worksite safety and compliance orientation</li>
          <li>Assessment preparation for certification</li>
        </ul>
        <div className="mt-8 rounded-xl border border-slate-300 bg-white/95 p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-950">Qualification</h2>
          <ul className="mt-3 list-disc pl-6 text-lg text-slate-900 space-y-2">
            {qualifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 rounded-xl border border-slate-300 bg-white/95 p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-950">Documentary Requirements</h2>
          <ul className="mt-3 list-disc pl-6 text-lg text-slate-900 space-y-2">
            {documentaryRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-10"><Link href="/programs" className="text-blue-900 hover:text-blue-950 font-semibold text-lg">Back to Programs</Link></div>
      </section>
    </main>
  );
}
