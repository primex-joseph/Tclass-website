"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, GraduationCap, Save, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";

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
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [users, setUsers] = useState<FacultyUserRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingTemplateKey, setSavingTemplateKey] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

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

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.employee_id} ${user.department} ${user.position}`.toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TClass Admin</span>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to Admin</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/admin" className="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Faculty RBAC</h1>
            <p className="mt-1 text-slate-600">
              Manage faculty workflow templates and per-user overrides for registrar, instructor, and default faculty access.
            </p>
          </div>
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
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">Loading faculty RBAC settings...</CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
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
                        <Save className="mr-2 h-4 w-4" />
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
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
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
                          <Save className="mr-2 h-4 w-4" />
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
      </main>
    </div>
  );
}

