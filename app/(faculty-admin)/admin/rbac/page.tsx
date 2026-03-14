"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  MessageSquare,
  School,
  ShieldCheck,
  Users,
} from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { AdminCsvImportTrigger } from "@/components/admin/csv-import-trigger";
import { AdminCsvGeneratorTrigger } from "@/components/admin/csv-generator-trigger";
import { GlobalSearchInput } from "@/components/shared/global-search-input";
import { PortalHeader, PortalSidebar } from "@/components/shared/portal-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarActionsMenu } from "@/components/ui/avatar-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearPortalSessionUserCache, usePortalSessionUser } from "@/lib/portal-session-user";

type PermissionCatalogItem = {
  key: string;
  label: string;
  description: string;
};

type TemplateRow = {
  key: string;
  label: string;
  permissions: string[];
};

type UserOverrideRow = {
  permission_name: string;
  is_allowed: boolean;
};

type FacultyUserRow = {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  position_id?: number | null;
  position: string;
  template: string | null;
  effective_permissions: string[];
  overrides: UserOverrideRow[];
};

type RbacPayload = {
  permissions?: PermissionCatalogItem[];
  templates?: TemplateRow[];
  users?: FacultyUserRow[];
};

const OVERRIDE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "allow", label: "Allow" },
  { value: "deny", label: "Deny" },
] as const;

function toOverrideMap(overrides: UserOverrideRow[]) {
  const map: Record<string, "allow" | "deny"> = {};
  for (const row of overrides) {
    map[row.permission_name] = row.is_allowed ? "allow" : "deny";
  }
  return map;
}

export default function AdminFacultyRbacPage() {
  const router = useRouter();
  const { sessionUser } = usePortalSessionUser();
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [users, setUsers] = useState<FacultyUserRow[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingTemplateKey, setSavingTemplateKey] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  const sessionName = sessionUser?.name?.trim() || "Account";
  const sessionEmail = sessionUser?.email?.trim() || "";
  const sessionInitials = sessionName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  const loadRbac = async () => {
    setLoading(true);
    try {
      const payload = (await apiFetch("/admin/rbac/faculty")) as RbacPayload;
      setPermissions(payload.permissions ?? []);
      setTemplates(payload.templates ?? []);
      setUsers(payload.users ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load faculty RBAC data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRbac();
  }, []);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = userSearchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.employee_id} ${user.department} ${user.position}`.toLowerCase().includes(query)
    );
  }, [userSearchQuery, users]);

  const toggleTemplatePermission = (templateKey: string, permissionKey: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.key !== templateKey) return template;
        const hasPermission = template.permissions.includes(permissionKey);
        return {
          ...template,
          permissions: hasPermission
            ? template.permissions.filter((value) => value !== permissionKey)
            : [...template.permissions, permissionKey].sort(),
        };
      })
    );
  };

  const saveTemplate = async (template: TemplateRow) => {
    setSavingTemplateKey(template.key);
    try {
      await apiFetch(`/admin/rbac/faculty/templates/${template.key}`, {
        method: "PATCH",
        body: JSON.stringify({ permission_keys: template.permissions }),
      });
      toast.success(`${template.label} template updated.`);
      await loadRbac();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update template.");
    } finally {
      setSavingTemplateKey(null);
    }
  };

  const updateUserTemplate = (userId: number, template: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, template } : user)));
  };

  const updateUserOverride = (userId: number, permissionKey: string, value: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        const nextMap = toOverrideMap(user.overrides);
        if (value === "default") {
          delete nextMap[permissionKey];
        } else {
          nextMap[permissionKey] = value === "allow" ? "allow" : "deny";
        }
        const overrides = Object.entries(nextMap).map(([permission_name, state]) => ({
          permission_name,
          is_allowed: state === "allow",
        }));
        return { ...user, overrides };
      })
    );
  };

  const saveUser = async (user: FacultyUserRow) => {
    setSavingUserId(user.id);
    try {
      await apiFetch(`/admin/rbac/faculty/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          template: user.template,
          overrides: user.overrides,
        }),
      });
      toast.success(`Updated RBAC for ${user.name}.`);
      await loadRbac();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user RBAC.");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleLogout = () => {
    document.cookie = "tclass_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "tclass_role=; path=/; max-age=0; samesite=lax";
    clearPortalSessionUserCache();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <PortalSidebar className="hidden xl:flex xl:w-64 xl:flex-col xl:border-r xl:border-slate-200/80 xl:bg-white xl:dark:border-white/10 xl:dark:bg-slate-900">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200/80 px-4 py-5 dark:border-white/10">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="h-20 w-20 ring-4 ring-blue-100 ring-offset-2 shadow-lg dark:ring-blue-900/50 dark:ring-offset-slate-900">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
                  {sessionInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sessionName}</p>
                {sessionEmail ? <p className="text-xs text-blue-600 dark:text-blue-400">{sessionEmail}</p> : null}
                <p className="text-xs text-slate-500 dark:text-slate-400">System Management</p>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
            <div className="space-y-1">
              <Link href="/admin" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><School className="h-4 w-4" />Dashboard</Link>
              <Link href="/admin" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><BarChart3 className="h-4 w-4" />Reports</Link>
              <Link href="/admin/enrollments" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><BookOpen className="h-4 w-4" />Enrollments</Link>
              <Link href="/admin/class-scheduling" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><Calendar className="h-4 w-4" />Class Scheduling</Link>
              <Link href="/admin/curriculum" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><FileText className="h-4 w-4" />Curriculum</Link>
            </div>
            <div className="space-y-1 border-t border-slate-200/80 pt-3 dark:border-white/10">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Management</p>
              <Link href="/admin/programs" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><BookOpen className="h-4 w-4" />Programs</Link>
              <Link href="/admin/departments" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><Building2 className="h-4 w-4" />Departments</Link>
              <Link href="/admin/rbac" className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-3 py-2.5 text-left text-sm font-medium text-white"><ShieldCheck className="h-4 w-4" />Faculty RBAC</Link>
              <Link href="/admin/admissions" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><CheckCircle className="h-4 w-4" />Admissions</Link>
              <Link href="/admin/vocationals" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"><BarChart3 className="h-4 w-4" />Vocationals</Link>
            </div>
          </nav>
        </div>
      </PortalSidebar>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PortalHeader className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
          <div className="px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="-ml-2 flex min-w-0 items-center gap-0 self-stretch">
                <Image src="/tclass_logo.png" alt="TClass Logo" width={90} height={90} className="block h-[90px] w-[90px] shrink-0 self-center object-contain" />
                <span className="-ml-4 hidden text-base font-bold text-slate-900 dark:text-slate-100 md:block">Tarlac Center for Learning and Skills Success</span>
              </div>
              <div className="flex flex-1 items-center justify-end gap-2 xl:gap-3">
                <GlobalSearchInput value={headerSearchQuery} onChange={setHeaderSearchQuery} placeholder="Search admin..." className="hidden lg:block lg:w-48 xl:w-56 2xl:w-64" />
                <AdminCsvImportTrigger className="h-9 rounded-xl border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10" />
                <AdminCsvGeneratorTrigger className="h-9 rounded-xl border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10" />
                <button type="button" className="hidden rounded-full border border-transparent p-2 text-slate-600 hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10 sm:inline-flex">
                  <MessageSquare className="h-5 w-5" />
                </button>
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{now ? now.toLocaleTimeString() : "--:--:--"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{now ? now.toLocaleDateString() : "---"}</p>
                </div>
                <AvatarActionsMenu initials={sessionInitials} onLogout={handleLogout} name={sessionName} subtitle={sessionEmail} triggerName={sessionName} triggerSubtitle={sessionEmail} triggerClassName="rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10" fallbackClassName="bg-blue-600 text-white" />
              </div>
            </div>
          </div>
        </PortalHeader>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 dark:bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.16),transparent_45%),linear-gradient(180deg,#020617,#020b16_55%,#020617)]">
          <div className="w-full space-y-8 px-4 py-6 sm:px-6 sm:py-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Faculty RBAC</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Manage faculty workflow templates and per-user overrides for registrar, instructor, and default faculty access.
              </p>
            </div>

            {loading ? (
              <Card>
                <CardContent className="p-6 text-sm text-slate-500">Loading faculty RBAC settings...</CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500">Templates</p>
                          <p className="text-xl font-bold text-slate-900">{templates.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500">Faculty Users</p>
                          <p className="text-xl font-bold text-slate-900">{users.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Permission Templates</h2>
                    <p className="text-sm text-slate-600">These templates become the base permissions assigned to faculty accounts.</p>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-3">
                    {templates.map((template) => (
                      <Card key={template.key}>
                        <CardHeader>
                          <CardTitle>{template.label}</CardTitle>
                          <CardDescription>{template.key}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {permissions.map((permission) => {
                              const checked = template.permissions.includes(permission.key);
                              return (
                                <label key={`${template.key}-${permission.key}`} className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleTemplatePermission(template.key, permission.key)}
                                    className="mt-1"
                                  />
                                  <span>
                                    <span className="font-medium text-slate-900">{permission.label}</span>
                                    <span className="mt-1 block text-xs text-slate-500">{permission.description}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          <Button onClick={() => void saveTemplate(template)} disabled={savingTemplateKey === template.key}>
                            {savingTemplateKey === template.key ? "Saving..." : "Save Template"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Per-User Overrides</h2>
                      <p className="text-sm text-slate-600">Apply a template first, then override individual permissions where needed.</p>
                    </div>
                    <Input
                      value={userSearchQuery}
                      onChange={(event) => setUserSearchQuery(event.target.value)}
                      placeholder="Search faculty users..."
                      className="w-full sm:w-72"
                    />
                  </div>

                  <div className="space-y-6">
                    {filteredUsers.map((user) => {
                      const overrideMap = toOverrideMap(user.overrides);
                      return (
                        <Card key={user.id}>
                          <CardHeader>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  {user.employee_id ? <Badge variant="outline">{user.employee_id}</Badge> : null}
                                  {user.department ? <Badge variant="outline">{user.department}</Badge> : null}
                                  {user.position ? <Badge variant="outline">{user.position}</Badge> : null}
                                </div>
                              </div>
                              <div className="w-full lg:w-72">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Base Template</label>
                                <select
                                  value={user.template ?? ""}
                                  onChange={(event) => updateUserTemplate(user.id, event.target.value)}
                                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                >
                                  {templates.map((template) => (
                                    <option key={template.key} value={template.key}>{template.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-3 lg:grid-cols-2">
                              {permissions.map((permission) => (
                                <div key={`${user.id}-${permission.key}`} className="rounded-lg border border-slate-200 p-3">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">{permission.label}</p>
                                      <p className="text-xs text-slate-500">{permission.description}</p>
                                    </div>
                                    <select
                                      value={overrideMap[permission.key] ?? "default"}
                                      onChange={(event) => updateUserOverride(user.id, permission.key, event.target.value)}
                                      className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
                                    >
                                      {OVERRIDE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Effective Permissions</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {user.effective_permissions.map((permission) => (
                                  <Badge key={`${user.id}-effective-${permission}`} variant="secondary">{permission}</Badge>
                                ))}
                              </div>
                            </div>
                            <Button onClick={() => void saveUser(user)} disabled={savingUserId === user.id}>
                              {savingUserId === user.id ? "Saving..." : "Save User Overrides"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {filteredUsers.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-sm text-slate-500">No faculty users matched your search.</CardContent>
                      </Card>
                    ) : null}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

