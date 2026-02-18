"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Clock, 
  Star,
  Users,
  Award,
  BookOpen,
  Menu,
  X,
  ExternalLink,
  Truck,
  HardHat,
  Laptop,
  Wrench
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { submitContactForm } from "@/lib/contact-submit";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const programs = [
    {
      id: 1,
      title: "Rigid Highway Dump Truck NCII",
      category: "heavy-equipment",
      icon: Truck,
      description: "School Based Training - Heavy Equipment Operation under TCLASS scholarship",
      duration: "3 months",
      slots: "Limited slots available",
      qualifications: [
        "At least High School or SHS Graduate/ALS passer/College level or graduate",
        "18 years old and above",
        "Physically and mentally fit",
        "Can comply with all requirements needed",
      ],
      documentaryRequirements: [
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
      ],
      image: "/programs/dump-truck.jpg"
    },
    {
      id: 2,
      title: "Transit Mixer NCII",
      category: "heavy-equipment",
      icon: Truck,
      description: "Professional training for concrete mixer truck operation with minimal fee",
      duration: "3 months",
      slots: "Now accepting applicants",
      qualifications: [
        "At least High School or SHS Graduate/ALS passer/College level or graduate",
        "18 years old and above",
        "Physically and mentally fit",
        "Can comply with all requirements needed",
      ],
      documentaryRequirements: [
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
      ],
      image: "/programs/transit-mixer.jpg"
    },
    {
      id: 3,
      title: "Forklift NCII",
      category: "heavy-equipment",
      icon: HardHat,
      description: "Comprehensive forklift operation training under maYAP Scholarship",
      duration: "2 months",
      slots: "Open for enrollment",
      qualifications: [
        "At least High School or SHS Graduate/ALS passer/College level or graduate",
        "18 years old and above",
        "Physically and mentally fit",
        "Can comply with all requirements needed",
      ],
      documentaryRequirements: [
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
      ],
      image: "/programs/forklift.jpg"
    },
    {
      id: 4,
      title: "3-Year Diploma in ICT",
      category: "ict",
      icon: Laptop,
      description: "Information and Communication Technology diploma program",
      duration: "3 years",
      slots: "5 SLOTS LEFT!",
      qualifications: [
        "18 years old and above",
        "Graduate of Senior High School / ALS / Old Curriculum",
        "Must meet interview requirements",
      ],
      documentaryRequirements: [
        "Valid ID / Recent School ID",
        "PSA Birth Certificate",
        "SF9 / Report Card",
        "Certificate of Good Moral Conduct",
      ],
      image: "/programs/ict.jpg"
    },
    {
      id: 5,
      title: "Housekeeping NCII",
      category: "services",
      icon: Award,
      description: "Professional housekeeping training under maYAP Scholarship",
      duration: "2 months",
      slots: "Now open",
      qualifications: [
        "At least High School or SHS Graduate/ALS passer/College level or graduate",
        "18 years old and above",
        "Physically and mentally fit",
        "Can comply with all requirements needed",
      ],
      documentaryRequirements: [
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
      ],
      image: "/programs/housekeeping.jpg"
    },
    {
      id: 6,
      title: "Health Care Services NCII",
      category: "services",
      icon: Users,
      description: "Comprehensive health care assistant training program",
      duration: "6 months",
      slots: "Limited slots",
      qualifications: [
        "At least High School or SHS Graduate/ALS passer/College level or graduate",
        "18 years old and above",
        "Physically and mentally fit",
        "Can comply with all requirements needed",
      ],
      documentaryRequirements: [
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
      ],
      image: "/programs/healthcare.jpg"
    }
  ];

  const news = [
    {
      id: 1,
      title: "TARA NA at Maging maYAP Scholar!",
      date: "January 26, 2026",
      excerpt: "Calling all TARLAQUEÑOS! Be a scholar today under the maYAP Scholarship Program.",
      image: "/news/scholarship.jpg",
      type: "Announcement"
    },
    {
      id: 2,
      title: "Meat Processing Community-Based Training Program",
      date: "February 10, 2026",
      excerpt: "Matagumpay na naisagawa ang Meat Processing Community-Based Training Program ng Provincial Government of Tarlac...",
      image: "/news/meat-processing.jpg",
      type: "Event"
    },
    {
      id: 3,
      title: "Heavy Equipment Operator Opportunity",
      date: "February 5, 2026",
      excerpt: "OPORTUNIDAD PARA SA MGA NAGNANAIS MAGING HEAVY EQUIPMENT OPERATOR! Apply now for our scholarship programs.",
      image: "/news/heavy-equipment.jpg",
      type: "Opportunity"
    }
  ];

  const filteredPrograms = activeTab === "all" 
    ? programs 
    : programs.filter(p => p.category === activeTab);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!contactForm.firstName.trim() || !contactForm.lastName.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSendingMessage(true);
    try {
      const response = await submitContactForm({
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
      });

      toast.success((response as { message?: string }).message ?? "Message sent successfully.");
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
    <div className="landing-page min-h-screen text-slate-900">
      {/* Top Bar */}
      <div className="bg-blue-950/95 text-blue-50 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              0917-706-6718
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Mail className="h-3 w-3" />
              pgt.tclass@gmail.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://www.facebook.com/pgt.tclass/" target="_blank" className="hover:text-blue-200 transition-colors duration-200">
              <Facebook className="h-4 w-4" />
            </Link>
            <span className="hidden sm:inline">Follow us on Facebook</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-blue-100/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-14 h-14">
                <Image
                  src="/tclass-logo.jpg"
                  alt="TCLASS Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">PGT - Tarlac Center</h1>
                <p className="text-xs text-slate-600 dark:text-slate-200">for Learning And Skills Success</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-3">
              <a href="#home" className="nav-chip">Home</a>
              <a href="#about" className="nav-chip">About</a>
              <a href="#programs" className="nav-chip">Programs</a>
              <Link href="/admission" className="nav-chip">Admission</Link>
              <a href="#news" className="nav-chip">News</a>
              <a href="#contact" className="nav-chip">Contact</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden sm:flex dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">Login</Button>
              </Link>
              <Link href="/student">
                <Button size="sm">Student Portal</Button>
              </Link>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950">
            <div className="px-4 py-3 space-y-1">
              <a href="#home" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#programs" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Programs</a>
              <Link href="/admission" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Admission</Link>
              <a href="#news" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>News</a>
              <a href="#contact" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                <Link href="/login" className="block px-3 py-2 text-base font-medium text-blue-600">Login</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative text-white min-h-[600px] lg:min-h-[700px] motion-fade-rise">
        {/* Background Image with TCLASS Logo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/tclass.jpg')" }}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-blue-800/70 to-blue-950/80" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex items-center min-h-[600px] lg:min-h-[700px]">
          <div className="max-w-3xl motion-fade-rise motion-delay-1">
            <Badge className="mb-4 bg-blue-200/90 text-blue-900 hover:bg-blue-200 font-semibold">EST. 2007</Badge>
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              PGT - Tarlac Center for<br />
              <span className="text-blue-200">Learning And Skills Success</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl drop-shadow-md">
              TechVoc Training Center that produces competent, employable and globally competitive graduates. 
              Under the Provincial Government of Tarlac.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="font-semibold shadow-lg shadow-blue-900/40">
                <Award className="h-5 w-5 mr-2" />
                Apply for Scholarship
              </Button>
              <Link href="/admission">
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm">
                <BookOpen className="h-5 w-5 mr-2" />
                Admission
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-6 lg:gap-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
                <Users className="h-5 w-5 text-blue-200" />
                <span className="text-sm font-medium">29K+ Followers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
                <Star className="h-5 w-5 text-blue-200" />
                <span className="text-sm font-medium">TESDA Accredited</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
                <Award className="h-5 w-5 text-blue-200" />
                <span className="text-sm font-medium">Government Funded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white/70 dark:bg-transparent motion-fade-rise motion-delay-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800">About Us</Badge>
              <h2 className="hero-title text-3xl md:text-4xl font-bold text-blue-950 dark:text-slate-100 mb-6">
                Empowering Tarlaqueños Through Quality Technical Education
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
                The Tarlac Center for Learning and Skills Success (TCLASS) is a premier technical vocational 
                training center under the Provincial Government of Tarlac. We are committed to providing 
                accessible, quality education that prepares our students for local and global employment.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">TESDA Accredited</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">National Certificate programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Scholarship Programs</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">TCLASS & maYAP scholarships</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Industry Partners</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Employment assistance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Hands-on Training</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Practical skills development</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-200 elev-card">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                  <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-16 w-16 text-white" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">Building Futures Since 2007</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-blue-600">17+</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="relative py-24 motion-fade-rise motion-delay-2">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: "url('/tclass.jpg')" }}
        />
        <div className="absolute inset-0 bg-white/88 dark:bg-transparent backdrop-blur-[1px] dark:backdrop-blur-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Our Programs</Badge>
            <h2 className="hero-title text-3xl md:text-4xl font-bold text-blue-950 dark:text-slate-100 mb-4">
              Training Programs & Scholarships
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We offer various TESDA-accredited programs under TCLASS and maYAP scholarships 
              with minimal fees or fully funded opportunities.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: "all", label: "All Programs" },
              { id: "heavy-equipment", label: "Heavy Equipment" },
              { id: "ict", label: "ICT & Tech" },
              { id: "services", label: "Services" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "bg-white/85 dark:bg-slate-900 dark:text-slate-200 text-slate-600 hover:bg-blue-50 dark:hover:bg-white/10 border border-blue-100 dark:border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-blue-950 dark:text-slate-100 mb-6">
            Programs
          </h3>

          {/* Programs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="overflow-hidden elev-card group h-full">
                <div className="h-48 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <program.icon className="h-20 w-20 text-white/80" />
                </div>
                <CardContent className="p-6 flex h-[240px] flex-col">
                  <Badge className="mb-3 bg-blue-100 text-blue-800">{program.slots}</Badge>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-base mb-4">{program.description}</p>
                  <div className="flex items-center justify-between text-base text-slate-700 dark:text-slate-300 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      NCII Certified
                    </span>
                  </div>
                  <div className="mt-auto">
                    <Link href={`/vocational?program=${encodeURIComponent(program.title)}`}>
                      <Button className="w-full">
                        Enroll Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News/Updates Section */}
      <section id="news" className="py-24 bg-white/75 dark:bg-transparent motion-fade-rise motion-delay-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">News & Updates</Badge>
            <h2 className="hero-title text-3xl md:text-4xl font-bold text-blue-950 dark:text-slate-100 mb-4">
              Latest from TCLASS
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Stay updated with our latest programs, events, and announcements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <Card key={item.id} className="overflow-hidden elev-card">
                <div className="h-48 bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">{item.excerpt}</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success(`Reading: ${item.title}`)}>
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="https://www.facebook.com/pgt.tclass/" target="_blank">
              <Button variant="outline" className="gap-2 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                <Facebook className="h-4 w-4" />
                View More on Facebook
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Badge className="mb-4 bg-blue-800 text-blue-100">Contact Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get In Touch With Us
              </h2>
              <p className="text-slate-400 mb-8">
                Visit our training center or reach out to us for inquiries about our programs and scholarships.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-800/80 rounded-lg border border-blue-700/70">
                    <MapPin className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Address</h4>
                    <p className="text-slate-400">
                      IT Training Center Bldg., Right Wing,<br />
                      IT Park I, Tibag Tarlac City,<br />
                      Tarlac, Philippines, 2300
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-800/80 rounded-lg border border-blue-700/70">
                    <Phone className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-slate-400">
                      0917-706-6718 (For training)<br />
                      0917-848-5235 (For assessment)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-800/80 rounded-lg border border-blue-700/70">
                    <Mail className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-slate-400">pgt.tclass@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-800/80 rounded-lg border border-blue-700/70">
                    <Clock className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Office Hours</h4>
                    <p className="text-slate-400">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-8 text-slate-900">
              <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Juan" required value={contactForm.firstName} onChange={(e) => setContactForm((prev) => ({ ...prev, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Dela Cruz" required value={contactForm.lastName} onChange={(e) => setContactForm((prev) => ({ ...prev, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="juan@example.com" required value={contactForm.email} onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0917XXXXXXX" value={contactForm.phone} onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none" placeholder="How can we help you?" required value={contactForm.message} onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full" disabled={isSendingMessage}>
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950/95 text-slate-300 py-12 border-t border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/tclass-logo.jpg"
                    alt="TCLASS Logo"
                    fill
                    className="object-contain rounded-full"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold">PGT - TCLASS</h3>
                  <p className="text-xs">Tarlac Center for Learning And Skills Success</p>
                </div>
              </div>
              <p className="text-sm mb-4 max-w-md">
                TechVoc Training Center under the Provincial Government of Tarlac that produces 
                competent, employable and globally competitive graduates.
              </p>
              <div className="flex gap-4">
                <Link href="https://www.facebook.com/pgt.tclass/" target="_blank" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/programs" className="hover:text-white transition-colors">Programs</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Student Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/programs/heavy-equipment" className="hover:text-white transition-colors">Heavy Equipment</Link></li>
                <li><Link href="/programs/ict-diploma" className="hover:text-white transition-colors">ICT Diploma</Link></li>
                <li><Link href="/programs/housekeeping" className="hover:text-white transition-colors">Housekeeping</Link></li>
                <li><Link href="/programs/health-care" className="hover:text-white transition-colors">Health Care</Link></li>
                <li><Link href="/programs/scholarships" className="hover:text-white transition-colors">Scholarships</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 PGT - Tarlac Center for Learning And Skills Success. All rights reserved.
            </p>
            <p className="text-sm">
              Provincial Government of Tarlac | TESDA Accredited
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
