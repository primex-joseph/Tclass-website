import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { StudentTopNav } from "@/components/student/top-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TClass - Student Portal",
  description: "TClass Student Learning Management System",
};

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} student-page min-h-screen antialiased`}>
      <StudentTopNav />
      <div className="pt-16 pb-24 md:pb-0">{children}</div>
    </div>
  );
}
