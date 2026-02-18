import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TClass - School Management System",
  description: "TClass School Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitializer = `
    (function () {
      try {
        var key = "tclass_theme";
        var saved = localStorage.getItem(key);
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var isDark = saved ? saved === "dark" : prefersDark;
        if (isDark) document.documentElement.classList.add("dark");
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${sora.variable} antialiased`}
      >
        {children}
        <ThemeToggle />
        <ToastProvider />
      </body>
    </html>
  );
}
