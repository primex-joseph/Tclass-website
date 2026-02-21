"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Facebook,
  GraduationCap,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { submitContactForm } from "@/lib/contact-submit";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";

const sectionLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#news", label: "News" },
  { href: "#contact", label: "Contact" },
] as const;

const newsItems = [
  {
    id: 1,
    title: "TARA NA at Maging maYAP Scholar",
    date: "January 26, 2026",
    excerpt: "Scholarship tracks are open for qualified applicants.",
    type: "Announcement",
  },
  {
    id: 2,
    title: "Meat Processing Community-Based Training Program",
    date: "February 10, 2026",
    excerpt: "Provincial-led training completed with local participation.",
    type: "Event",
  },
  {
    id: 3,
    title: "Heavy Equipment Operator Opportunity",
    date: "February 5, 2026",
    excerpt: "Application season is open for heavy equipment programs.",
    type: "Opportunity",
  },
] as const;

const pillars = [
  "TESDA accredited tracks",
  "Scholarship-backed enrollment",
  "Government support",
  "Hands-on training",
  "Employment-ready pathways",
] as const;

const steps = [
  {
    title: "Choose Program",
    description: "Select a track based on demand, duration, and career goals.",
  },
  {
    title: "Submit Requirements",
    description: "Complete the admission form and required documents.",
  },
  {
    title: "Start Training",
    description: "Attend orientation and begin practical classes.",
  },
] as const;

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !contactForm.firstName.trim() ||
      !contactForm.lastName.trim() ||
      !contactForm.email.trim() ||
      !contactForm.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSendingMessage(true);
    try {
      const response = await submitContactForm(contactForm);
      toast.success((response as { message?: string }).message ?? "Message sent.");
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="landing-page min-h-screen text-slate-900 dark:text-slate-100">
      <div className="bg-blue-950/95 py-2 text-[11px] text-blue-50 sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              0917-706-6718
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Mail className="h-3.5 w-3.5" />
              pgt.tclass@gmail.com
            </span>
          </div>
          <Link
            href="https://www.facebook.com/pgt.tclass/"
            target="_blank"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-200"
          >
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Follow us</span>
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/88 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 sm:h-14 sm:w-14">
              <Image
                src="/tclass-logo.jpg"
                alt="TCLASS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
                PGT - TCLASS
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 sm:text-xs">
                Tarlac Center for Learning And Skills Success
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {sectionLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-chip">
                {link.label}
              </a>
            ))}

          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeIconButton />
            <Link href="/login" className="hidden sm:block">
              <Button
                size="sm"
                className="gap-2 rounded-md bg-blue-600 text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen((value) => !value)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[120] lg:hidden ${mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeMobileMenu}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`absolute left-0 top-0 h-full w-[84%] max-w-[21rem] border-r border-slate-200 bg-white px-3 pb-4 pt-4 shadow-[0_26px_65px_rgba(15,23,42,0.35)] transition-transform duration-300 dark:border-white/15 dark:bg-slate-950 dark:shadow-[0_26px_65px_rgba(0,0,0,0.65)] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/15">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10">
                <Image src="/tclass-logo.jpg" alt="TCLASS Logo" fill className="rounded-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">TCLASS Portal</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Navigation</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              onClick={closeMobileMenu}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/15 dark:bg-slate-900">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Theme</span>
            <ThemeIconButton />
          </div>

          <div className="space-y-1.5">
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </a>
            ))}

            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Login Portal
            </Link>
          </div>
        </aside>
      </div>

      <main>
        <section id="home" className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/tclass.jpg')" }} aria-hidden />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,20,56,0.94)_0%,rgba(12,54,130,0.78)_45%,rgba(5,17,45,0.88)_100%)]" aria-hidden />

          <div className="relative mx-auto grid min-h-[82svh] max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-24 lg:pt-24">
            <div>
              <Badge className="mb-4 border border-blue-100/20 bg-white/15 text-blue-50 backdrop-blur-sm">Since 2007 | Career-focused training</Badge>
              <h1 className="hero-title max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Build job-ready skills with a modern training center in Tarlac.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-blue-50/90 sm:text-lg">
                TCLASS delivers scholarship-supported and industry-aligned programs for practical employability.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/programs" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-white to-blue-50 px-8 py-6 font-semibold text-blue-900 shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-50 hover:to-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] active:translate-y-0 dark:from-white dark:to-blue-50 dark:text-blue-900 dark:hover:from-blue-50 dark:hover:to-white sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Enroll now
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">17+</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Years of service</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">6</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Core tracks</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">TESDA</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Accredited</p>
                </div>
              </div>
            </div>


          </div>
        </section>

        <section className="border-y border-blue-100/70 bg-white/82 py-6 dark:border-white/10 dark:bg-slate-900/55">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 sm:px-6 lg:px-8">
            {pillars.map((item) => (
              <div key={item} className="rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-blue-900 dark:border-white/15 dark:bg-white/5 dark:text-blue-100">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-100">About TCLASS</Badge>
              <h2 className="hero-title text-3xl font-bold text-blue-950 dark:text-slate-100 sm:text-4xl">A practical training center focused on employability.</h2>
              <p className="mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                TCLASS delivers accessible and outcome-driven technical education under the Provincial Government of Tarlac.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/75">
                  <GraduationCap className="mb-2 h-5 w-5 text-blue-600 dark:text-blue-300" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">TESDA Standards</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Curriculum aligned with competency requirements.</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/75">
                  <Award className="mb-2 h-5 w-5 text-blue-600 dark:text-blue-300" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Scholarship Access</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">TCLASS and maYAP support for qualified applicants.</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/75">
                  <Users className="mb-2 h-5 w-5 text-blue-600 dark:text-blue-300" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Industry Relevance</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tracks designed for in-demand local roles.</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/75">
                  <Wrench className="mb-2 h-5 w-5 text-blue-600 dark:text-blue-300" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hands-on Practice</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Supervised practical sessions and coaching.</p>
                </div>
              </div>
            </div>

            <Card className="elev-card overflow-hidden rounded-3xl border-blue-100 dark:border-white/10">
              <CardContent className="space-y-4 p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Why learners choose us</h3>
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />Clear path from enrollment to certification.</p>
                  <p className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />Training focused on real workplace outcomes.</p>
                  <p className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />Government-backed community trust and support.</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/85 p-5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-800 dark:text-blue-200">Campus Location</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">IT Training Center Bldg., IT Park I, Tibag, Tarlac City</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <Badge className="mb-4 bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-100">Enrollment Flow</Badge>
              <h2 className="hero-title text-3xl font-bold text-blue-950 dark:text-slate-100 sm:text-4xl">Simple and guided from inquiry to training.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card key={step.title} className="elev-card overflow-hidden">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-700 dark:text-blue-200">Step {index + 1}</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="bg-white/70 py-16 dark:bg-transparent md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <Badge className="mb-4 bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-100">News & Updates</Badge>
              <h2 className="hero-title text-3xl font-bold text-blue-950 dark:text-slate-100 sm:text-4xl">Latest from TCLASS</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {newsItems.map((item) => (
                <Card key={item.id} className="elev-card overflow-hidden">
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-200 to-blue-100 dark:from-slate-900 dark:to-slate-800">
                    <BookOpen className="h-11 w-11 text-slate-500 dark:text-slate-400" />
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.excerpt}</p>
                    <Button type="button" variant="outline" className="mt-5 w-full dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" onClick={() => toast.success(`Reading: ${item.title}`)}>
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center sm:mt-10">
              <Link href="https://www.facebook.com/pgt.tclass/" target="_blank">
                <Button variant="outline" className="w-full gap-2 border-blue-200 bg-white/85 text-blue-900 hover:bg-blue-50 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:w-auto">
                  <Facebook className="h-4 w-4" />
                  View updates on Facebook
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 py-16 text-white md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.22),transparent_42%),radial-gradient(circle_at_90%_15%,rgba(37,99,235,0.25),transparent_36%)]" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-8">
            <div>
              <Badge className="mb-4 border border-white/25 bg-white/10 text-blue-100">Contact Us</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">Talk with our admissions team.</h2>
              <p className="mt-4 text-sm text-slate-200 sm:text-base">Reach out for program matching, requirements, and scholarship guidance.</p>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-100"><MapPin className="h-4 w-4" />Address</p>
                  <p className="text-sm text-slate-100">IT Training Center Bldg., Right Wing, IT Park I, Tibag, Tarlac City, Tarlac, Philippines, 2300</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-100"><Phone className="h-4 w-4" />Phone</p>
                  <p className="text-sm text-slate-100">0917-706-6718 (Training) | 0917-848-5235 (Assessment)</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-100"><Clock className="h-4 w-4" />Office Hours</p>
                  <p className="text-sm text-slate-100">Monday to Friday | 8:00 AM to 5:00 PM</p>
                </div>
              </div>
            </div>

            <Card className="glass-panel rounded-3xl border-white/25 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950/85 dark:text-slate-100">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Send a message</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">We typically respond within one working day.</p>
                <form className="mt-6 space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">First Name</label>
                      <input
                        id="first-name"
                        type="text"
                        placeholder="Juan"
                        required
                        value={contactForm.firstName}
                        onChange={(event) => setContactForm((previous) => ({ ...previous, firstName: event.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Last Name</label>
                      <input
                        id="last-name"
                        type="text"
                        placeholder="Dela Cruz"
                        required
                        value={contactForm.lastName}
                        onChange={(event) => setContactForm((previous) => ({ ...previous, lastName: event.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="juan@example.com"
                      required
                      value={contactForm.email}
                      onChange={(event) => setContactForm((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="0917XXXXXXX"
                      value={contactForm.phone}
                      onChange={(event) => setContactForm((previous) => ({ ...previous, phone: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Message</label>
                    <textarea
                      id="message"
                      placeholder="How can we help you?"
                      required
                      value={contactForm.message}
                      onChange={(event) => setContactForm((previous) => ({ ...previous, message: event.target.value }))}
                      className="h-32 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-100"
                    />
                  </div>
                  <Button type="submit" disabled={isSendingMessage} className="w-full">
                    {isSendingMessage ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-900/40 bg-slate-950/95 py-10 text-slate-300 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-12 w-12">
                  <Image src="/tclass-logo.jpg" alt="TCLASS Logo" fill className="rounded-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-white">PGT - TCLASS</h3>
                  <p className="text-xs text-slate-400">Tarlac Center for Learning And Skills Success</p>
                </div>
              </div>
              <p className="max-w-md text-sm text-slate-400">A TechVoc training center of the Provincial Government of Tarlac producing competent and employable graduates.</p>
              <Link href="https://www.facebook.com/pgt.tclass/" target="_blank" className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-blue-600">
                <Facebook className="h-4 w-4" />
              </Link>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#home" className="transition-colors hover:text-white">Home</a></li>
                <li><a href="#about" className="transition-colors hover:text-white">About</a></li>
                <li><a href="#programs" className="transition-colors hover:text-white">Programs</a></li>
                <li><a href="#news" className="transition-colors hover:text-white">News</a></li>
                <li><a href="#contact" className="transition-colors hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Portals</h4>
              <ul className="space-y-2 text-sm">

                <li><Link href="/vocational" className="transition-colors hover:text-white">Vocational Programs</Link></li>
                <li><Link href="/programs" className="transition-colors hover:text-white">Program Pages</Link></li>
                <li><Link href="/login" className="transition-colors hover:text-white">Student Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-7 text-center text-sm text-slate-400 md:flex-row md:text-left">
            <p>(c) 2026 PGT - Tarlac Center for Learning And Skills Success. All rights reserved.</p>
            <p>Provincial Government of Tarlac | TESDA Accredited</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
