import Link from "next/link";

export default function IctDiplomaPage() {
  const qualifications = [
    "18 years old and above",
    "Graduate of Senior High School / ALS / Old Curriculum",
    "Must meet interview requirements",
  ];

  const documentaryRequirements = [
    "Valid ID / Recent School ID",
    "PSA Birth Certificate",
    "SF9 / Report Card",
    "Certificate of Good Moral Conduct",
  ];

  return (
    <main className="relative min-h-screen text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/92" />
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-blue-950">ICT Diploma Program</h1>
        <p className="mt-6 text-xl text-slate-800 leading-relaxed">
          The ICT Diploma program develops foundational and intermediate digital skills for learners pursuing
          careers in information and communication technology.
        </p>
        <ul className="mt-8 list-disc pl-6 text-lg text-slate-800 space-y-2">
          <li>Core computing and productivity tools</li>
          <li>Practical networking and systems basics</li>
          <li>Project-based learning and portfolio building</li>
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
