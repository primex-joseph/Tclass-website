"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus, RefreshCw, Trash2, UserRoundCog } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORG_CHART_STORAGE_KEY, ORG_CHART_UPDATED_EVENT, parseOrgChart } from "@/lib/org-chart-signatories";

type OrgChartNode = {
  id: string;
  name: string;
  position: string;
  parentId: string | null;
  createdAt: number;
};

const DEFAULT_ORG_CHART: OrgChartNode[] = [
  { id: "node-board", name: "Insert Name", position: "Board of Directors", parentId: null, createdAt: 1 },
  { id: "node-ceo", name: "Insert Name", position: "CEO", parentId: "node-board", createdAt: 2 },
  { id: "node-advisory", name: "Insert Name", position: "Advisory Board", parentId: "node-ceo", createdAt: 3 },
  { id: "node-staff-director", name: "Insert Name", position: "Staff Director", parentId: "node-ceo", createdAt: 4 },
  { id: "node-volunteer-director", name: "Insert Name", position: "Volunteer Director", parentId: "node-ceo", createdAt: 5 },
];

const makeNodeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

function OrgBranch({
  node,
  selectedId,
  childrenByParent,
  onSelect,
}: {
  node: OrgChartNode;
  selectedId: string | null;
  childrenByParent: Record<string, OrgChartNode[]>;
  onSelect: (id: string) => void;
}) {
  const children = childrenByParent[node.id] ?? [];
  const initials = node.name
    .split(" ")
    .map((chunk) => chunk.trim()[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={`group relative min-w-[188px] rounded-xl border px-4 py-2.5 text-center shadow-md transition-all duration-200 ${
          selectedId === node.id
            ? "border-indigo-400 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white ring-4 ring-indigo-100"
            : "border-indigo-200 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 text-white hover:-translate-y-0.5 hover:from-indigo-600 hover:via-violet-600 hover:to-indigo-600"
        }`}
      >
        <span className="absolute -top-3 left-1/2 inline-flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-700 shadow-sm">
          {initials || "ST"}
        </span>
        <p className="mt-1 text-sm font-semibold leading-tight">{node.position}</p>
        <p className="mt-0.5 text-[11px] text-white/90">{node.name}</p>
      </button>

      {children.length > 0 ? (
        <>
          <div className="h-4 w-px bg-slate-300/90" />
          <div className="flex flex-wrap items-start justify-center gap-4 border-t border-slate-300/90 pt-4">
            {children.map((child) => (
              <OrgBranch
                key={child.id}
                node={child}
                selectedId={selectedId}
                childrenByParent={childrenByParent}
                onSelect={onSelect}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function EditableOrgChart() {
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 160;
  const ZOOM_STEP = 10;

  const [nodes, setNodes] = useState<OrgChartNode[]>(DEFAULT_ORG_CHART);
  const [selectedId, setSelectedId] = useState<string | null>(DEFAULT_ORG_CHART[0]?.id ?? null);
  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newParentId, setNewParentId] = useState<string>("none");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let active = true;
    const hydrateChart = async () => {
      try {
        const response = await fetch("/api/admin/org-chart", { method: "GET", cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as { nodes?: unknown };
          const remoteNodes = parseOrgChart(JSON.stringify(payload.nodes ?? []));
          if (remoteNodes.length && active) {
            setNodes(remoteNodes);
            setSelectedId((prev) => (prev && remoteNodes.some((row) => row.id === prev) ? prev : remoteNodes[0]?.id ?? null));
            setStorageReady(true);
            return;
          }
        }
      } catch {
        // Fallback to local cache when API is unavailable.
      }

      try {
        const raw = window.localStorage.getItem(ORG_CHART_STORAGE_KEY);
        const cachedNodes = parseOrgChart(raw);
        if (cachedNodes.length && active) {
          setNodes(cachedNodes);
          setSelectedId((prev) => (prev && cachedNodes.some((row) => row.id === prev) ? prev : cachedNodes[0]?.id ?? null));
        }
      } finally {
        if (active) setStorageReady(true);
      }
    };

    void hydrateChart();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !storageReady) return;
    window.localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(nodes));
    window.dispatchEvent(new Event(ORG_CHART_UPDATED_EVENT));
    void fetch("/api/admin/org-chart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ nodes }),
    });
  }, [nodes, storageReady]);

  const sortedNodes = useMemo(() => [...nodes].sort((a, b) => a.createdAt - b.createdAt), [nodes]);

  const childrenByParent = useMemo(() => {
    const buckets: Record<string, OrgChartNode[]> = {};
    for (const node of sortedNodes) {
      if (!node.parentId) continue;
      if (!buckets[node.parentId]) buckets[node.parentId] = [];
      buckets[node.parentId].push(node);
    }
    return buckets;
  }, [sortedNodes]);

  const roots = useMemo(() => sortedNodes.filter((node) => !node.parentId), [sortedNodes]);
  const selectedNode = useMemo(() => sortedNodes.find((node) => node.id === selectedId) ?? null, [selectedId, sortedNodes]);

  const getDescendantIds = useCallback((startId: string) => {
    const descendants = new Set<string>();
    const stack = [startId];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      const children = childrenByParent[current] ?? [];
      for (const child of children) {
        if (descendants.has(child.id)) continue;
        descendants.add(child.id);
        stack.push(child.id);
      }
    }
    return descendants;
  }, [childrenByParent]);

  const reparentOptions = useMemo(() => {
    if (!selectedNode) return sortedNodes;
    const blocked = getDescendantIds(selectedNode.id);
    blocked.add(selectedNode.id);
    return sortedNodes.filter((node) => !blocked.has(node.id));
  }, [getDescendantIds, selectedNode, sortedNodes]);

  const isSelectedSamplePlaceholder = Boolean(selectedNode) && selectedNode?.name.trim().toLowerCase() === "insert name";
  const selectedNameValue = isSelectedSamplePlaceholder ? "" : selectedNode?.name ?? "";
  const selectedPositionValue = isSelectedSamplePlaceholder ? "" : selectedNode?.position ?? "";

  const updateSelectedNode = (patch: Partial<OrgChartNode>) => {
    if (!selectedNode) return;
    setNodes((prev) => prev.map((row) => (row.id === selectedNode.id ? { ...row, ...patch } : row)));
  };

  const handleAddRole = () => {
    if (!newName.trim()) {
      toast.error("Role holder name is required.");
      return;
    }
    if (!newPosition.trim()) {
      toast.error("Position title is required.");
      return;
    }

    const node: OrgChartNode = {
      id: makeNodeId(),
      name: newName.trim(),
      position: newPosition.trim(),
      parentId: newParentId === "none" ? null : newParentId,
      createdAt: Date.now(),
    };

    setNodes((prev) => [...prev, node]);
    setSelectedId(node.id);
    setNewName("");
    setNewPosition("");
    setNewParentId("none");
    toast.success("Role added to the organizational chart.");
  };

  const handleRemoveSelected = () => {
    if (!selectedNode) return;
    const descendants = getDescendantIds(selectedNode.id);
    const impacted = descendants.size + 1;
    const ok = window.confirm(`Remove ${selectedNode.position} and ${impacted - 1} child role(s)?`);
    if (!ok) return;

    const removeSet = new Set<string>([selectedNode.id, ...descendants]);
    const filtered = sortedNodes.filter((node) => !removeSet.has(node.id));
    setNodes(filtered);
    setSelectedId(filtered[0]?.id ?? null);
    toast.success("Role removed.");
  };

  const handleReset = () => {
    const ok = window.confirm("Reset the org chart to default sample structure?");
    if (!ok) return;
    setNodes(DEFAULT_ORG_CHART);
    setSelectedId(DEFAULT_ORG_CHART[0]?.id ?? null);
    toast.success("Org chart reset.");
  };

  const changeZoom = (next: number) => {
    setZoomPercent(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)));
  };

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
      <CardHeader className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/70 dark:to-slate-900/40">
        <CardTitle className="text-center text-xl font-bold text-slate-900 dark:text-slate-100">
          Organizational Chart
        </CardTitle>
        <div className="border-b border-slate-200 pt-2 dark:border-white/10" />
        <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400">
          Edit names, assign positions, and define reporting lines.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-slate-950/50 dark:to-slate-950/20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-slate-950/40">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Zoom</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={() => changeZoom(zoomPercent - ZOOM_STEP)}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <input
                aria-label="Chart zoom"
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={5}
                value={zoomPercent}
                onChange={(event) => changeZoom(Number(event.target.value))}
                className="h-1.5 w-28 cursor-pointer accent-blue-600"
              />
              <p className="w-12 text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{zoomPercent}%</p>
              <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={() => changeZoom(zoomPercent + ZOOM_STEP)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => changeZoom(100)}>
                Reset
              </Button>
            </div>
          </div>
          <div className="max-h-[650px] overflow-auto rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-slate-950/30">
            {roots.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No roles yet. Add a top-level role to start.</p>
            ) : (
              <div className="inline-flex min-w-full justify-center">
                <div
                  className="flex flex-wrap items-start justify-center gap-8 pb-4 pt-2 transition-transform duration-150 ease-out"
                  style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: "top center" }}
                >
                  {roots.map((root) => (
                    <OrgBranch
                      key={root.id}
                      node={root}
                      selectedId={selectedId}
                      childrenByParent={childrenByParent}
                      onSelect={setSelectedId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm xl:sticky xl:top-4 dark:border-white/10 dark:from-slate-950/40 dark:to-slate-950/20">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            {selectedNode ? `Selected: ${selectedNode.position}` : "Select a node card from the chart to edit."}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-slate-950/40">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add role</p>
            <Input placeholder="Full name" value={newName} onChange={(event) => setNewName(event.target.value)} />
            <Input placeholder="Position title" value={newPosition} onChange={(event) => setNewPosition(event.target.value)} />
            <Select value={newParentId} onValueChange={setNewParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Reports to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Top-level role</SelectItem>
                {sortedNodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" className="w-full sm:w-auto" onClick={handleAddRole}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-slate-950/40">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <UserRoundCog className="h-4 w-4 text-blue-600" />
              Edit selected role
            </p>
            <Input
              placeholder={selectedNode?.name ?? "Full name"}
              value={selectedNameValue}
              onChange={(event) => updateSelectedNode({ name: event.target.value })}
              disabled={!selectedNode}
            />
            <Input
              placeholder={selectedNode?.position ?? "Position title"}
              value={selectedPositionValue}
              onChange={(event) => updateSelectedNode({ position: event.target.value })}
              disabled={!selectedNode}
            />
            <Select
              value={selectedNode?.parentId ?? "none"}
              onValueChange={(value) => updateSelectedNode({ parentId: value === "none" ? null : value })}
              disabled={!selectedNode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Reports to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No manager (top-level)</SelectItem>
                {reparentOptions.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="destructive" className="w-full sm:w-auto" onClick={handleRemoveSelected} disabled={!selectedNode}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Selected Role
            </Button>
          </div>

          <Button type="button" variant="outline" className="w-full justify-center sm:w-auto" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Sample Chart
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click a card in the chart to focus/edit it quickly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
