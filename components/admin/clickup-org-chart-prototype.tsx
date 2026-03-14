"use client";

import { type ChangeEvent, type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  type Connection,
  type Edge,
  Handle,
  type Node,
  type NodeTypes,
  type NodeProps,
  Position,
  type ReactFlowInstance,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  type Viewport,
} from "@xyflow/react";
import {
  ArrowRightLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Clipboard,
  FileText,
  FormInput,
  Goal,
  Hand,
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointer2,
  PencilLine,
  Plus,
  Redo2,
  Search,
  Settings2,
  Share2,
  StickyNote,
  Target,
  Trash2,
  Undo2,
  UsersRound,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  type OrgChartCanvasNode,
  type OrgChartCanvasPayload,
  type OrgChartNodeKind,
  type OrgChartViewport,
  DEFAULT_ORG_CHART_VIEWPORT,
  ORG_CHART_CANVAS_STORAGE_KEY,
  ORG_CHART_CANVAS_VERSION,
  ROLE_TASK_PLACEHOLDER,
  getClickupOrgChartSeedPayload,
  normalizeOrgChartPayload,
  withUpgradedLayout,
} from "@/lib/org-chart-canvas";
import styles from "./clickup-org-chart-prototype.module.css";
import "@xyflow/react/dist/style.css";

type ToolMode = "select" | "pan" | "add" | "note" | "text" | "image";
type SaveState = "idle" | "saving" | "saved" | "error";
type NodeEditorDraft = {
  nodeId: string;
  name: string;
  position: string;
  note: string;
};
type SetModelNodesOptions = {
  preserveFlowPositions?: boolean;
};

type OrgNodeData = {
  node: OrgChartCanvasNode;
};

type OrgFlowNode = Node<OrgNodeData, "orgCard">;

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 0.1;
const INPUT_COMMIT_DEBOUNCE_MS = 420;
const AUTOSAVE_DEBOUNCE_MS = 1400;
const MAX_HISTORY = 40;
const VIEWPORT_EPSILON = 0.0001;

const TOOLBAR_ITEMS = [
  { key: "select" as const, icon: MousePointer2, label: "Select", shortcut: "V" },
  { key: "pan" as const, icon: Hand, label: "Hand", shortcut: "H" },
  { key: "add" as const, icon: Plus, label: "Role", shortcut: "N" },
  { key: "note" as const, icon: StickyNote, label: "Note", shortcut: "D" },
  { key: "text" as const, icon: PencilLine, label: "Text", shortcut: "T" },
  { key: "image" as const, icon: ImageIcon, label: "Image", shortcut: "I" },
];

const LEFT_RAIL_ITEMS = [
  { label: "Home", icon: Home },
  { label: "Planner", icon: Clock3 },
  { label: "AI", icon: Bot },
  { label: "Teams", icon: UsersRound },
  { label: "Docs", icon: FileText },
  { label: "Dashboard", icon: Target },
  { label: "Whiteboards", icon: LayoutTemplate, active: true },
  { label: "Forms", icon: FormInput },
  { label: "Clips", icon: Clipboard },
  { label: "Goals", icon: Goal },
];

function makeNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `oc-${crypto.randomUUID()}`;
  }
  return `oc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

function isViewportEqual(a: OrgChartViewport, b: OrgChartViewport) {
  return (
    Math.abs(a.x - b.x) < VIEWPORT_EPSILON &&
    Math.abs(a.y - b.y) < VIEWPORT_EPSILON &&
    Math.abs(a.zoom - b.zoom) < VIEWPORT_EPSILON
  );
}

function isLegacyPlaceholderName(value: string) {
  return value.trim().toLowerCase() === "insert name";
}

function clonePayload(nodes: OrgChartCanvasNode[], viewport: OrgChartViewport) {
  return {
    nodes: nodes.map((node) => ({ ...node })),
    viewport: { ...viewport },
  };
}

function ensureRoleNodeDefaults(node: OrgChartCanvasNode): OrgChartCanvasNode {
  if ((node.kind ?? "role") !== "role") return node;
  const note = node.note.trim() ? node.note : ROLE_TASK_PLACEHOLDER;
  return { ...node, note, kind: "role" };
}

function createsCycle(nodes: OrgChartCanvasNode[], childId: string, nextParentId: string | null) {
  if (!nextParentId) return false;
  if (childId === nextParentId) return true;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  let cursor: string | null = nextParentId;
  const seen = new Set<string>();
  while (cursor) {
    if (cursor === childId) return true;
    if (seen.has(cursor)) return false;
    seen.add(cursor);
    const nextNode = byId.get(cursor);
    cursor = nextNode?.parentId ?? null;
  }
  return false;
}

function getDescendants(nodes: OrgChartCanvasNode[], rootId: string) {
  const descendants = new Set<string>();
  const childrenByParent = new Map<string, string[]>();
  for (const node of nodes) {
    if (!node.parentId) continue;
    const bucket = childrenByParent.get(node.parentId) ?? [];
    bucket.push(node.id);
    childrenByParent.set(node.parentId, bucket);
  }

  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const children = childrenByParent.get(current) ?? [];
    for (const childId of children) {
      if (descendants.has(childId)) continue;
      descendants.add(childId);
      stack.push(childId);
    }
  }

  return descendants;
}

function syncFlowNodesWithModel(
  modelNodes: OrgChartCanvasNode[],
  prevFlowNodes: OrgFlowNode[],
  preservePositions = true,
): OrgFlowNode[] {
  const prevMap = new Map(prevFlowNodes.map((node) => [node.id, node]));
  return modelNodes.map((node) => {
    const prev = prevMap.get(node.id);
    return {
      id: node.id,
      type: "orgCard",
      data: { node },
      position:
        preservePositions && prev
          ? prev.position
          : {
              x: node.x,
              y: node.y,
            },
      draggable: true,
      selectable: true,
    };
  });
}

function toFlowEdges(nodes: OrgChartCanvasNode[]): Edge[] {
  return nodes
    .filter((node) => Boolean(node.parentId))
    .map((node) => ({
      id: `edge-${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: "smoothstep",
      animated: false,
      style: { stroke: "var(--oc-connector)", strokeWidth: 1.35 },
    }));
}

function OrgCardNode({ data, selected, dragging }: NodeProps<OrgFlowNode>) {
  const node = ensureRoleNodeDefaults(data.node);
  const kind = node.kind ?? "role";
  const displayName = isLegacyPlaceholderName(node.name) ? "" : node.name.trim();
  const displayPosition = node.position.trim();
  const displayTask = node.note.trim() ? node.note.trim() : ROLE_TASK_PLACEHOLDER;

  if (kind === "legend") {
    return (
      <div className={`${styles.legendNode} ${selected ? styles.nodeSelected : ""}`}>
        <p className={styles.legendTitle}>{node.position}</p>
        <p className={styles.legendBody}>{node.note}</p>
      </div>
    );
  }

  if (kind === "tip") {
    return (
      <div className={`${styles.tipNode} ${selected ? styles.nodeSelected : ""}`}>
        <p className={styles.tipBody}>{node.note}</p>
      </div>
    );
  }

  if (kind === "company") {
    return (
      <div className={`${styles.companyNode} ${selected ? styles.nodeSelected : ""}`}>
        <div className={styles.companyOrb}>
          <span>Company</span>
          <span>Logo</span>
        </div>
        <p className={styles.companyName}>{node.position}</p>
        <p className={styles.companySubtitle}>{node.note}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.roleNode} ${selected ? styles.nodeSelected : ""} ${dragging ? styles.roleNodeDragging : ""}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.rolePositionBand}>
        <p className={styles.rolePositionText}>{displayPosition || "Position e.g. CEO"}</p>
      </div>
      <div className={styles.roleNameBand}>
        <p className={styles.roleNameText}>{displayName || "Name e.g. Howard Garcia"}</p>
      </div>
      <div className={styles.roleDescriptionPanel}>
        <p className={styles.roleDescriptionText}>{displayTask}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}

const nodeTypes: NodeTypes = { orgCard: OrgCardNode };

function OrgChartPrototypeCanvas() {
  const [nodes, setNodes] = useState<OrgChartCanvasNode[]>([]);
  const [flowNodes, setFlowNodes] = useState<OrgFlowNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [viewport, setViewport] = useState<OrgChartViewport>(DEFAULT_ORG_CHART_VIEWPORT);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("Auto-save enabled");
  const [isReady, setIsReady] = useState(false);
  const [isHydrationFromFallback, setIsHydrationFromFallback] = useState(false);
  const [editorDraft, setEditorDraft] = useState<NodeEditorDraft | null>(null);

  const flowRef = useRef<ReactFlowInstance<OrgFlowNode, Edge> | null>(null);
  const hasAppliedInitialViewport = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const inputCommitTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inspectorEditingRef = useRef(false);
  const undoStackRef = useRef<Array<{ nodes: OrgChartCanvasNode[]; viewport: OrgChartViewport }>>([]);
  const redoStackRef = useRef<Array<{ nodes: OrgChartCanvasNode[]; viewport: OrgChartViewport }>>([]);

  const flowEdges = useMemo(() => toFlowEdges(nodes), [nodes]);
  const selectedNode = useMemo(
    () => (selectedIds.length > 0 ? nodes.find((node) => node.id === selectedIds[0]) ?? null : null),
    [nodes, selectedIds],
  );

  const captureSnapshot = useCallback(() => clonePayload(nodes, viewport), [nodes, viewport]);

  const pushUndo = useCallback(() => {
    undoStackRef.current.push(captureSnapshot());
    if (undoStackRef.current.length > MAX_HISTORY) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
  }, [captureSnapshot]);

  const replaceState = useCallback((nextNodes: OrgChartCanvasNode[], nextViewport: OrgChartViewport) => {
    setNodes(nextNodes);
    setFlowNodes(syncFlowNodesWithModel(nextNodes, [], false));
    setViewport(nextViewport);
    setSelectedIds([]);
    if (flowRef.current) {
      flowRef.current.setViewport(nextViewport, { duration: 120 });
    }
  }, []);

  const setModelNodes = useCallback(
    (
      updater: OrgChartCanvasNode[] | ((prev: OrgChartCanvasNode[]) => OrgChartCanvasNode[]),
      options?: SetModelNodesOptions,
    ) => {
      const preserveFlowPositions = options?.preserveFlowPositions ?? true;
      setNodes((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        setFlowNodes((prevFlowNodes) => syncFlowNodesWithModel(next, prevFlowNodes, preserveFlowPositions));
        return next;
      });
    },
    [],
  );

  const handleUndo = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (!prev) return;
    redoStackRef.current.push(captureSnapshot());
    replaceState(prev.nodes, prev.viewport);
    setSaveState("saving");
  }, [captureSnapshot, replaceState]);

  const handleRedo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    undoStackRef.current.push(captureSnapshot());
    replaceState(next.nodes, next.viewport);
    setSaveState("saving");
  }, [captureSnapshot, replaceState]);

  const updateNode = useCallback((nodeId: string, patch: Partial<OrgChartCanvasNode>) => {
    setModelNodes((prev) => prev.map((node) => (node.id === nodeId ? ensureRoleNodeDefaults({ ...node, ...patch }) : node)));
    setSaveState("saving");
  }, [setModelNodes]);

  const updateFlowNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setFlowNodes((prev) => {
      let changed = false;
      const next = prev.map((row) => {
        if (row.id !== nodeId) return row;
        if (Math.abs(row.position.x - x) < VIEWPORT_EPSILON && Math.abs(row.position.y - y) < VIEWPORT_EPSILON) {
          return row;
        }
        changed = true;
        return {
          ...row,
          position: { x, y },
        };
      });
      return changed ? next : prev;
    });
  }, []);

  const commitNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      setModelNodes((prev) => {
        let changed = false;
        const next = prev.map((row) => {
          if (row.id !== nodeId) return row;
          if (Math.abs(row.x - x) < VIEWPORT_EPSILON && Math.abs(row.y - y) < VIEWPORT_EPSILON) {
            return row;
          }
          changed = true;
          return { ...row, x, y };
        });
        return changed ? next : prev;
      });
    },
    [setModelNodes],
  );

  const commitEditorDraft = useCallback(
    (draft: NodeEditorDraft) => {
      const current = nodes.find((row) => row.id === draft.nodeId);
      if (!current) return;
      if (current.name === draft.name && current.position === draft.position && current.note === draft.note) return;
      setModelNodes((prev) =>
        prev.map((node) =>
          node.id === draft.nodeId
            ? ensureRoleNodeDefaults({
                ...node,
                name: draft.name,
                position: draft.position,
                note: draft.note,
              })
            : node,
        ),
      );
      setSaveState("saving");
    },
    [nodes, setModelNodes],
  );

  const flushEditorDraft = useCallback(() => {
    if (!editorDraft) return;
    if (inputCommitTimerRef.current) {
      window.clearTimeout(inputCommitTimerRef.current);
      inputCommitTimerRef.current = null;
    }
    commitEditorDraft(editorDraft);
  }, [commitEditorDraft, editorDraft]);

  const addNode = useCallback(
    (kind: OrgChartNodeKind, position?: { x: number; y: number }) => {
      const center = flowRef.current?.screenToFlowPosition({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.55,
      });

      const x = position?.x ?? center?.x ?? 120;
      const y = position?.y ?? center?.y ?? 200;
      const id = makeNodeId();
      const newNode: OrgChartCanvasNode = ensureRoleNodeDefaults({
        id,
        kind,
        name: kind === "role" ? "" : kind === "company" ? "Company" : "Notes",
        position:
          kind === "role"
            ? "CEO"
            : kind === "legend"
              ? "LEGEND"
              : kind === "company"
                ? "COMPANY NAME"
                : "Pro-tip",
        parentId: null,
        createdAt: Date.now(),
        x,
        y,
        note:
          kind === "role"
            ? ROLE_TASK_PLACEHOLDER
            : kind === "company"
              ? "Organizational Chart"
              : "Type note...",
      });

      pushUndo();
      setModelNodes((prev) => [...prev, newNode], { preserveFlowPositions: true });
      setSelectedIds([id]);
      setToolMode("select");
      setSaveState("saving");
    },
    [pushUndo, setModelNodes],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    pushUndo();
    const removeSet = new Set(selectedIds);
    setModelNodes((prev) =>
      prev
        .filter((node) => !removeSet.has(node.id))
        .map((node) => (node.parentId && removeSet.has(node.parentId) ? { ...node, parentId: null } : node)),
    );
    setSelectedIds([]);
    setSaveState("saving");
    toast.success("Selected node(s) removed.");
  }, [pushUndo, selectedIds, setModelNodes]);

  const handleSetParent = useCallback(
    (nodeId: string, parentId: string | null) => {
      setModelNodes((prev) => {
        if (createsCycle(prev, nodeId, parentId)) {
          toast.error("That connection would create a loop.");
          return prev;
        }
        return prev.map((node) => (node.id === nodeId ? { ...node, parentId } : node));
      });
      setSaveState("saving");
    },
    [setModelNodes],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      pushUndo();
      handleSetParent(connection.target, connection.source);
    },
    [handleSetParent, pushUndo],
  );

  const handleReconnect = useCallback(
    (_oldEdge: Edge, connection: Connection) => {
      if (!connection.source || !connection.target) return;
      pushUndo();
      handleSetParent(connection.target, connection.source);
      toast.success("Reporting line updated.");
    },
    [handleSetParent, pushUndo],
  );

  const handlePaneClick = useCallback(
    (event: ReactMouseEvent) => {
      if (toolMode !== "add" && toolMode !== "note" && toolMode !== "text") return;
      const pos = flowRef.current?.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      if (!pos) return;
      if (toolMode === "add") addNode("role", pos);
      if (toolMode === "note") addNode("tip", pos);
      if (toolMode === "text") addNode("legend", pos);
    },
    [addNode, toolMode],
  );

  const handleImageUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !selectedNode) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        pushUndo();
        updateNode(selectedNode.id, { logoUrl: reader.result });
        toast.success("Image attached to selected node.");
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [pushUndo, selectedNode, updateNode],
  );

  const resetViewport = useCallback(() => {
    if (!flowRef.current) return;
    const next = { x: 0, y: 0, zoom: 1 };
    pushUndo();
    flowRef.current.setViewport(next, { duration: 200 });
    setViewport(next);
    setSaveState("saving");
  }, [pushUndo]);

  const nudgeZoom = useCallback(
    (direction: 1 | -1) => {
      if (!flowRef.current) return;
      const current = flowRef.current.getViewport();
      const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, current.zoom + direction * ZOOM_STEP));
      const nextViewport = { ...current, zoom: Number(nextZoom.toFixed(2)) };
      pushUndo();
      flowRef.current.setViewport(nextViewport, { duration: 140 });
      setViewport(nextViewport);
      setSaveState("saving");
    },
    [pushUndo],
  );

  const fitCanvas = useCallback(() => {
    if (!flowRef.current) return;
    pushUndo();
    flowRef.current.fitView({ padding: 0.24, duration: 220 });
    setTimeout(() => {
      if (!flowRef.current) return;
      setViewport(flowRef.current.getViewport());
      setSaveState("saving");
    }, 260);
  }, [pushUndo]);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const response = await fetch("/api/admin/org-chart", { method: "GET", cache: "no-store", credentials: "same-origin" });
        if (response.ok) {
          const payload = withUpgradedLayout(normalizeOrgChartPayload(await response.json()));
          if (active) {
            setNodes(payload.nodes);
            setFlowNodes(syncFlowNodesWithModel(payload.nodes, [], false));
            setViewport(payload.viewport);
            setSaveMessage("Synced with server");
            setIsHydrationFromFallback(false);
            setIsReady(true);
            return;
          }
        }
      } catch {
        // Falls through to local cache/seed.
      }

      try {
        const raw = window.localStorage.getItem(ORG_CHART_CANVAS_STORAGE_KEY);
        const payload = withUpgradedLayout(normalizeOrgChartPayload(raw ? JSON.parse(raw) : null));
        if (active) {
          setNodes(payload.nodes);
          setFlowNodes(syncFlowNodesWithModel(payload.nodes, [], false));
          setViewport(payload.viewport);
          setSaveMessage("Working from local cache (server unavailable)");
          setIsHydrationFromFallback(true);
          setIsReady(true);
        }
      } catch {
        if (active) {
          const seed = getClickupOrgChartSeedPayload();
          setNodes(seed.nodes);
          setFlowNodes(syncFlowNodesWithModel(seed.nodes, [], false));
          setViewport(seed.viewport);
          setSaveMessage("Loaded default prototype template");
          setIsHydrationFromFallback(true);
          setIsReady(true);
        }
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !flowRef.current || hasAppliedInitialViewport.current) return;
    flowRef.current.setViewport(viewport, { duration: 0 });
    hasAppliedInitialViewport.current = true;
  }, [isReady, viewport]);

  useEffect(() => {
    if (!selectedNode) {
      setEditorDraft(null);
      return;
    }
    setEditorDraft((prev) => {
      const normalizedSelectedName = isLegacyPlaceholderName(selectedNode.name) ? "" : selectedNode.name;
      const next = {
        nodeId: selectedNode.id,
        name: normalizedSelectedName,
        position: selectedNode.position,
        note: selectedNode.note,
      };
      if (
        prev &&
        prev.nodeId === next.nodeId &&
        prev.name === next.name &&
        prev.position === next.position &&
        prev.note === next.note
      ) {
        return prev;
      }
      return next;
    });
  }, [selectedNode]);

  useEffect(() => {
    if (!editorDraft) return;
    if (inputCommitTimerRef.current) window.clearTimeout(inputCommitTimerRef.current);
    inputCommitTimerRef.current = window.setTimeout(() => {
      commitEditorDraft(editorDraft);
      inputCommitTimerRef.current = null;
    }, INPUT_COMMIT_DEBOUNCE_MS);
    return () => {
      if (inputCommitTimerRef.current) {
        window.clearTimeout(inputCommitTimerRef.current);
      }
    };
  }, [commitEditorDraft, editorDraft]);

  useEffect(() => {
    if (!isReady) return;
    const payload: OrgChartCanvasPayload = {
      nodes,
      viewport,
      meta: {
        version: ORG_CHART_CANVAS_VERSION,
        updatedAt: Date.now(),
      },
    };

    try {
      window.localStorage.setItem(ORG_CHART_CANVAS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore local storage quota issues for prototype mode.
    }

    setSaveState("saving");
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/org-chart", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("save failed");
        setSaveState("saved");
        setSaveMessage("All changes saved");
      } catch {
        setSaveState("error");
        setSaveMessage("Save failed. Local cache kept.");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [isReady, nodes, viewport]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && (key === "y" || (key === "z" && event.shiftKey))) {
        event.preventDefault();
        handleRedo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "0") {
        event.preventDefault();
        resetViewport();
        return;
      }

      if (key === "v") setToolMode("select");
      if (key === "h") setToolMode("pan");
      if (key === "n") addNode("role");
      if (key === "d") addNode("tip");
      if (key === "t") addNode("legend");
      if (key === "i") fileInputRef.current?.click();
      if (key === "=" || key === "+") nudgeZoom(1);
      if (key === "-") nudgeZoom(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (inputCommitTimerRef.current) {
        window.clearTimeout(inputCommitTimerRef.current);
      }
    };
  }, [addNode, deleteSelected, handleRedo, handleUndo, nudgeZoom, resetViewport]);

  const selectedNodeParentOptions = useMemo(() => {
    if (!selectedNode) return nodes;
    const blocked = getDescendants(nodes, selectedNode.id);
    blocked.add(selectedNode.id);
    return nodes.filter((node) => !blocked.has(node.id));
  }, [nodes, selectedNode]);

  const zoomPercent = Math.round((viewport.zoom || 1) * 100);

  return (
    <div className={styles.root}>
      <aside className={styles.leftRail}>
        <div className={styles.workspaceLabel}>
          <div className={styles.workspaceDot}>C</div>
          <span>PrimeX Ventures</span>
        </div>
        <nav className={styles.railNav}>
          {LEFT_RAIL_ITEMS.map((item) => (
            <button key={item.label} type="button" className={`${styles.railItem} ${item.active ? styles.railItemActive : ""}`}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className={styles.boardArea}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button type="button" className={styles.ghostIcon}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={styles.ghostIcon}>
              <ChevronRight size={16} />
            </button>
            <div className={styles.boardTitle}>Organizational Chart</div>
          </div>
          <div className={styles.searchShell}>
            <Search size={15} />
            <span>Search</span>
            <kbd>Ctrl K</kbd>
          </div>
          <div className={styles.topBarRight}>
            <button type="button" className={styles.ghostIcon}>
              <Settings2 size={16} />
            </button>
            <button type="button" className={styles.actionBtn}>
              <Share2 size={15} />
              <span>Share</span>
            </button>
          </div>
        </header>

        <div className={styles.canvasWrap}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            onInit={(instance) => {
              flowRef.current = instance;
              if (!hasAppliedInitialViewport.current) {
                instance.setViewport(viewport, { duration: 0 });
                hasAppliedInitialViewport.current = true;
              }
            }}
            onConnect={handleConnect}
            onReconnect={handleReconnect}
            onPaneClick={handlePaneClick}
            onNodeDragStart={() => pushUndo()}
            onNodeDrag={(_, node) => {
              updateFlowNodePosition(node.id, node.position.x, node.position.y);
            }}
            onNodeDragStop={(_, node) => {
              commitNodePosition(node.id, node.position.x, node.position.y);
              setSaveState("saving");
            }}
            onSelectionChange={({ nodes: selected }) => {
              const nextIds = selected.map((row) => row.id);
              setSelectedIds((prev) => {
                if (nextIds.length === 0 && prev.length > 0 && inspectorEditingRef.current) {
                  return prev;
                }
                return areStringArraysEqual(prev, nextIds) ? prev : nextIds;
              });
            }}
            onMoveEnd={(_, nextViewport: Viewport) => {
              const next = {
                x: nextViewport.x,
                y: nextViewport.y,
                zoom: nextViewport.zoom,
              };
              setViewport((prev) => (isViewportEqual(prev, next) ? prev : next));
            }}
            fitView={false}
            minZoom={ZOOM_MIN}
            maxZoom={ZOOM_MAX}
            defaultEdgeOptions={{
              style: { stroke: "var(--oc-connector)", strokeWidth: 1.35 },
              type: "smoothstep",
            }}
            panActivationKeyCode="Space"
            panOnDrag={toolMode === "pan"}
            autoPanOnNodeDrag
            nodesDraggable={toolMode !== "pan"}
            elementsSelectable={toolMode !== "pan"}
            elevateNodesOnSelect
            selectionOnDrag={toolMode === "select"}
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={null}
            className={styles.reactFlow}
          >
            <Background gap={24} size={1.2} color="var(--oc-grid-dot)" />
          </ReactFlow>

          <div className={styles.zoomHud}>
            <button type="button" onClick={() => nudgeZoom(-1)} aria-label="Zoom out">
              -
            </button>
            <span>{zoomPercent}%</span>
            <button type="button" onClick={() => nudgeZoom(1)} aria-label="Zoom in">
              +
            </button>
            <button type="button" onClick={resetViewport} aria-label="Reset zoom">
              100%
            </button>
            <button type="button" onClick={fitCanvas} aria-label="Fit view">
              Fit
            </button>
          </div>

          <div className={styles.dock}>
            {TOOLBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${styles.dockItem} ${toolMode === item.key ? styles.dockItemActive : ""}`}
                onClick={() => {
                  if (item.key === "image") {
                    fileInputRef.current?.click();
                    return;
                  }
                  setToolMode(item.key);
                }}
                title={`${item.label} (${item.shortcut})`}
              >
                <item.icon size={16} />
                <span>{item.shortcut}</span>
              </button>
            ))}
            <button type="button" className={styles.dockItem} onClick={handleUndo} title="Undo (Ctrl/Cmd+Z)">
              <Undo2 size={16} />
            </button>
            <button type="button" className={styles.dockItem} onClick={handleRedo} title="Redo (Ctrl/Cmd+Y)">
              <Redo2 size={16} />
            </button>
          </div>
        </div>
      </section>

      <aside
        className={styles.inspector}
        onFocusCapture={() => {
          inspectorEditingRef.current = true;
        }}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget as globalThis.Node | null;
          if (nextTarget && event.currentTarget.contains(nextTarget)) return;
          inspectorEditingRef.current = false;
          flushEditorDraft();
        }}
      >
        <div className={styles.statusCard}>
          <p className={styles.statusTitle}>Auto Save</p>
          <p className={styles.statusValue}>{saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Error" : "Idle"}</p>
          <p className={styles.statusHint}>{saveMessage}</p>
          {isHydrationFromFallback ? <p className={styles.warning}>Server fetch failed. Running from local cache/seed.</p> : null}
        </div>

        <div className={styles.editorCard}>
          <p className={styles.editorTitle}>Selected Node</p>
          {!selectedNode ? (
            <p className={styles.emptyState}>Select any node to edit details, parent line, or delete.</p>
          ) : (
            <div className={styles.formStack}>
              <label className={styles.fieldLabel}>
                Name
                <input
                  value={editorDraft?.nodeId === selectedNode.id ? editorDraft.name : selectedNode.name}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      nodeId: selectedNode.id,
                      name: event.target.value,
                      position: prev?.nodeId === selectedNode.id ? prev.position : selectedNode.position,
                      note: prev?.nodeId === selectedNode.id ? prev.note : selectedNode.note,
                    }))
                  }
                  onBlur={flushEditorDraft}
                  placeholder="e.g. Howard Garcia"
                />
              </label>
              <label className={styles.fieldLabel}>
                Position
                <input
                  value={editorDraft?.nodeId === selectedNode.id ? editorDraft.position : selectedNode.position}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      nodeId: selectedNode.id,
                      name: prev?.nodeId === selectedNode.id ? prev.name : selectedNode.name,
                      position: event.target.value,
                      note: prev?.nodeId === selectedNode.id ? prev.note : selectedNode.note,
                    }))
                  }
                  onBlur={flushEditorDraft}
                  placeholder="e.g. CEO"
                />
              </label>
              <label className={styles.fieldLabel}>
                Description
                <textarea
                  rows={4}
                  value={editorDraft?.nodeId === selectedNode.id ? editorDraft.note : selectedNode.note}
                  onChange={(event) =>
                    setEditorDraft((prev) => ({
                      nodeId: selectedNode.id,
                      name: prev?.nodeId === selectedNode.id ? prev.name : selectedNode.name,
                      position: prev?.nodeId === selectedNode.id ? prev.position : selectedNode.position,
                      note: event.target.value,
                    }))
                  }
                  onBlur={flushEditorDraft}
                  placeholder={ROLE_TASK_PLACEHOLDER}
                />
              </label>
              <label className={styles.fieldLabel}>
                Reports To
                <select
                  value={selectedNode.parentId ?? "none"}
                  onChange={(event) => {
                    pushUndo();
                    handleSetParent(selectedNode.id, event.target.value === "none" ? null : event.target.value);
                  }}
                >
                  <option value="none">Top-level</option>
                  {selectedNodeParentOptions
                    .filter((node) => node.id !== selectedNode.id && (node.kind ?? "role") === "role")
                    .map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.position}
                      </option>
                    ))}
                </select>
              </label>
              <div className={styles.inlineActions}>
                <button type="button" onClick={() => deleteSelected()} className={styles.dangerBtn}>
                  <Trash2 size={14} />
                  Delete Selected
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pushUndo();
                const nextSeed = getClickupOrgChartSeedPayload();
                setNodes(nextSeed.nodes);
                setFlowNodes(syncFlowNodesWithModel(nextSeed.nodes, [], false));
                setViewport(nextSeed.viewport);
                setSelectedIds([]);
                toast.success("Prototype chart reset.");
              }}
                  className={styles.softBtn}
                >
                  Reset Seed
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.shortcutCard}>
          <p className={styles.editorTitle}>Shortcuts</p>
          <ul>
            <li>`V` Select tool</li>
            <li>`H` Hand tool</li>
            <li>`N` New role node</li>
            <li>`D` New note node</li>
            <li>`T` New text panel</li>
            <li>`Space + Drag` Pan canvas</li>
            <li>`Delete` Remove selection</li>
            <li>`Ctrl/Cmd + Z/Y` Undo/redo</li>
            <li>`Ctrl/Cmd + 0` Reset zoom</li>
          </ul>
          <button type="button" className={styles.softBtn} onClick={() => addNode("role")}>
            <Plus size={14} />
            Add Role
          </button>
          <button
            type="button"
            className={styles.softBtn}
              onClick={() => {
                pushUndo();
                setModelNodes((prev) => [...prev, ensureRoleNodeDefaults({
                  id: makeNodeId(),
                name: "Howard Garcia",
                position: "Executive Assistant",
                parentId: null,
                createdAt: Date.now(),
                x: 640,
                y: 210,
                note: ROLE_TASK_PLACEHOLDER,
                kind: "role",
              })]);
            }}
          >
            <ArrowRightLeft size={14} />
            Quick Add Sample
          </button>
        </div>
      </aside>

      <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenInput} onChange={handleImageUpload} />
    </div>
  );
}

export function ClickupOrgChartPrototype() {
  return (
    <ReactFlowProvider>
      <OrgChartPrototypeCanvas />
    </ReactFlowProvider>
  );
}
