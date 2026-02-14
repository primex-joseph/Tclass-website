import Link from "next/link";

const newsItems = [
  {
    title: "TARA NA at Maging maYAP Scholar!",
    date: "January 26, 2026",
    summary: "Scholarship intake announcement for qualified applicants in Tarlac.",
  },
  {
    title: "Meat Processing Community-Based Training Program",
    date: "February 10, 2026",
    summary: "Community-based upskilling event completed under local government support.",
  },
  {
    title: "Heavy Equipment Operator Opportunity",
    date: "February 5, 2026",
    summary: "Call for applicants for heavy equipment scholarship opportunities.",
  },
];

export default function NewsPage() {
  return (
    <main className="relative min-h-screen text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tclass.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/92" />
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-base font-semibold tracking-wide text-blue-800 uppercase">News</p>
        <h1 className="mt-2 text-4xl font-bold text-blue-950">Latest Updates</h1>

        <div className="mt-10 space-y-5">
          {newsItems.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-300 bg-white/95 p-6 shadow-sm">
              <p className="text-base text-slate-700">{item.date}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-xl text-slate-800">{item.summary}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/" className="text-blue-900 hover:text-blue-950 font-semibold text-lg">Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
