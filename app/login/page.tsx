"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeIconButton } from "@/components/ui/theme-icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_COOKIE_ROLE, AUTH_COOKIE_TOKEN, getRoleHome, normalizeRole, type UserRole } from "@/lib/auth";

type LoginResponse = {
  token?: string;
  access_token?: string;
  role?: string;
  user?: { role?: string; name?: string };
  message?: string;
};

const userTypes = [
  { id: "student" as UserRole, label: "Student", icon: Users },
  { id: "faculty" as UserRole, label: "Faculty", icon: Building2 },
  { id: "admin" as UserRole, label: "Admin", icon: ShieldCheck },
] as const;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiBaseUrl) {
      toast.error("Missing NEXT_PUBLIC_API_BASE_URL in env.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: userType,
        }),
      });

      const data: LoginResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.message ?? "Invalid credentials.");
        return;
      }

      const token = data.token ?? data.access_token;
      const role = normalizeRole(data.user?.role ?? data.role) ?? userType;

      if (!token) {
        toast.error("No token returned by backend.");
        return;
      }

      document.cookie = `${AUTH_COOKIE_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=86400; samesite=lax`;
      document.cookie = `${AUTH_COOKIE_ROLE}=${role}; path=/; max-age=86400; samesite=lax`;
      localStorage.setItem("tclass_last_login_email", email.trim().toLowerCase());

      const redirect = searchParams.get("redirect");
      const target = redirect && redirect.startsWith("/") ? redirect : getRoleHome(role);

      toast.success("Login successful");
      router.push(target);
      router.refresh();
    } catch {
      toast.error("Cannot connect to backend API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/tclass.jpg')" }} />
      <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80" />
      
      {/* Theme Toggle - moved to form header */}

      {/* Back to Home (mobile) */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors lg:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Login Modal */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl min-h-[500px] lg:min-h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900">
          {/* Decorative */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          {/* Top */}
          <div className="relative z-10">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>

          {/* Center */}
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                <Image 
                  src="/tclass-logo.jpg" 
                  alt="TCLASS Logo" 
                  fill 
                  className="object-cover" 
                  priority 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">PGT - TCLASS</h1>
                <p className="text-blue-200 text-sm">Tarlac Center for Learning And Skills Success</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Welcome to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                TCLASS Portal
              </span>
            </h2>
            
            <p className="text-blue-100/80 text-base leading-relaxed mb-8">
              Access your personalized dashboard to manage courses, track progress, and connect with your learning community.
            </p>

            {/* Feature Points */}
            <div className="space-y-4">
              {[
                { icon: GraduationCap, text: "TESDA Accredited Programs" },
                { icon: ShieldCheck, text: "Secure & Reliable Platform" },
                { icon: Users, text: "Join 1000+ Students" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-blue-100/80">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5">
                    <feature.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Spacer */}
          <div className="relative z-10" />
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 sm:p-10 xl:p-12 flex flex-col justify-center">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                <Image src="/tclass-logo.jpg" alt="TCLASS" fill className="object-cover" priority />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">TCLASS Portal</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Sign in to continue</p>
              </div>
            </div>
            <ThemeIconButton />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select your account type to continue</p>
            </div>
            <ThemeIconButton />
          </div>

          {/* User Type Selector */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {userTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  if (type.id !== userType) {
                    setSwitchingRole(type.id);
                    setTimeout(() => {
                      setUserType(type.id);
                      setSwitchingRole(null);
                    }, 400);
                  }
                }}
                disabled={switchingRole !== null}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                  userType === type.id
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10"
                    : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                } ${switchingRole === type.id ? "scale-95" : ""}`}
              >
                {/* Loading overlay */}
                {switchingRole === type.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                )}
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  userType === type.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${
                  userType === type.id ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email / Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <Input
                  id="email"
                  type="text"
                  className="pl-11 h-12 text-base rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 dark:bg-[#1e293b] dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-11 pr-11 h-12 text-base rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 dark:bg-[#1e293b] dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 mt-2" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account? Please contact your administrator
            </p>
          </div>
        </div>
      </div>

      {/* Copyright (desktop) */}
      <div className="hidden lg:block absolute bottom-4 text-white/40 text-xs">
        © {new Date().getFullYear()} Provincial Government of Tarlac. All rights reserved.
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800" />
        <div className="w-48 h-4 rounded bg-slate-800" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
