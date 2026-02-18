"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Eye, EyeOff, Lock, Mail, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100 dark:from-blue-950 dark:via-slate-950 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        <div className="hidden lg:flex flex-col justify-center text-slate-900 dark:text-white">
          <Link href="/" className="inline-flex items-center text-blue-700 dark:text-blue-200 hover:text-blue-900 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16">
              <Image src="/tclass-logo.jpg" alt="TCLASS Logo" fill className="object-contain rounded-full" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PGT - TCLASS</h1>
              <p className="text-blue-700 dark:text-blue-200">Tarlac Center for Learning And Skills Success</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome to <span className="text-blue-600 dark:text-yellow-400">TCLASS Portal</span></h2>
          <p className="text-slate-700 dark:text-blue-100 text-lg">Sign in with your backend account to continue.</p>
        </div>

        <Card className="shadow-2xl bg-white/95 dark:bg-slate-950/85 border-blue-100/80 dark:border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900 dark:text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Choose account type and enter credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: "student", label: "Student", icon: Users },
                { id: "faculty", label: "Faculty", icon: Building2 },
                { id: "admin", label: "Admin", icon: Lock },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setUserType(type.id as UserRole)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    userType === type.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300"
                      : "border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-blue-300/50 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-800 dark:text-slate-100">Email / Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="email"
                    type="text"
                    className="pl-9 bg-white dark:bg-slate-950/85 border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 [color-scheme:light] dark:[color-scheme:dark] autofill:bg-white dark:autofill:bg-slate-950"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-800 dark:text-slate-100">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10 bg-white dark:bg-slate-950/85 border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 [color-scheme:light] dark:[color-scheme:dark] autofill:bg-white dark:autofill:bg-slate-950"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100 dark:from-blue-950 dark:via-slate-950 dark:to-blue-900" />}>
      <LoginPageContent />
    </Suspense>
  );
}
