import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/92" />
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-base font-semibold tracking-wide text-blue-800 uppercase">About Us</p>
        <h1 className="mt-2 text-4xl font-bold text-blue-950">About PGT - TCLASS</h1>
        <p className="mt-6 text-xl text-slate-800 leading-relaxed">
          PGT - Tarlac Center for Learning And Skills Success (TCLASS) is a technical-vocational training
          institution under the Provincial Government of Tarlac. We focus on practical, industry-aligned skills
          training to help learners become competent, employable, and globally competitive.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-slate-300 bg-white/95 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Mission</h2>
            <p className="mt-3 text-lg text-slate-800">Deliver accessible and quality technical education for Tarlaquenos.</p>
          </article>
          <article className="rounded-xl border border-slate-300 bg-white/95 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Vision</h2>
            <p className="mt-3 text-lg text-slate-800">Produce graduates ready for local and global opportunities.</p>
          </article>
        </div>
        <div className="mt-10">
          <Link href="/" className="text-blue-900 hover:text-blue-950 font-semibold text-lg">Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
