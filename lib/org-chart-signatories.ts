type OrgChartNode = {
  id: string;
  name: string;
  position: string;
  parentId: string | null;
  createdAt: number;
};

export const ORG_CHART_STORAGE_KEY = "tclass_admin_org_chart_v1";
export const ORG_CHART_UPDATED_EVENT = "tclass-org-chart-updated";

const isRealName = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && normalized !== "insert name";
};

export const parseOrgChart = (raw: string | null): OrgChartNode[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is Partial<OrgChartNode> => Boolean(row && typeof row === "object"))
      .map((row) => ({
        id: String(row.id ?? ""),
        name: String(row.name ?? ""),
        position: String(row.position ?? ""),
        parentId: row.parentId ? String(row.parentId) : null,
        createdAt: Number.isFinite(row.createdAt) ? Number(row.createdAt) : 0,
      }))
      .filter((row) => row.id && row.position)
      .sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
};

export const getOrgChartNodes = (): OrgChartNode[] => {
  if (typeof window === "undefined") return [];
  return parseOrgChart(window.localStorage.getItem(ORG_CHART_STORAGE_KEY));
};

export const resolvePreferredSignatoryName = (nodes: OrgChartNode[]): string => {
  if (!nodes.length) return "";

  const byPosition = (keyword: string) =>
    nodes.find((row) => row.position.toLowerCase().includes(keyword) && isRealName(row.name));

  const registrar = byPosition("registrar");
  if (registrar) return registrar.name.trim();

  const schoolAdmin =
    byPosition("school admin") ??
    byPosition("administrator") ??
    byPosition("admin") ??
    byPosition("principal") ??
    byPosition("dean") ??
    byPosition("director") ??
    byPosition("school head");
  if (schoolAdmin) return schoolAdmin.name.trim();

  const firstValid = nodes.find((row) => isRealName(row.name));
  return firstValid ? firstValid.name.trim() : "";
};

export const getPreferredSignatoryName = (): string => resolvePreferredSignatoryName(getOrgChartNodes());

export const getPreferredSignatoryNameRemote = async (): Promise<string> => {
  if (typeof window === "undefined") return "";
  try {
    const response = await fetch("/api/admin/org-chart", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return getPreferredSignatoryName();
    const payload = (await response.json()) as { nodes?: OrgChartNode[] };
    const remoteName = resolvePreferredSignatoryName(Array.isArray(payload.nodes) ? payload.nodes : []);
    if (remoteName) return remoteName;
  } catch {
    // Fall back to local source when API is unavailable.
  }
  return getPreferredSignatoryName();
};
