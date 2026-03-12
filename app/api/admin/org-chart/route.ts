import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type OrgChartNode = {
  id: string;
  name: string;
  position: string;
  parentId: string | null;
  createdAt: number;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "org-chart.json");

const normalizeNodes = (input: unknown): OrgChartNode[] => {
  if (!Array.isArray(input)) return [];
  return input
    .filter((row): row is Partial<OrgChartNode> => Boolean(row && typeof row === "object"))
    .map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      position: String(row.position ?? ""),
      parentId: row.parentId ? String(row.parentId) : null,
      createdAt: Number.isFinite(row.createdAt) ? Number(row.createdAt) : Date.now(),
    }))
    .filter((row) => row.id.length > 0 && row.position.length > 0)
    .sort((a, b) => a.createdAt - b.createdAt);
};

async function readNodes(): Promise<OrgChartNode[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(content) as { nodes?: unknown };
    return normalizeNodes(parsed.nodes);
  } catch {
    return [];
  }
}

export async function GET() {
  const nodes = await readNodes();
  return NextResponse.json({ nodes });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { nodes?: unknown };
    const nodes = normalizeNodes(body.nodes);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ nodes }, null, 2), "utf8");
    return NextResponse.json({ ok: true, nodes });
  } catch {
    return NextResponse.json({ message: "Failed to save organizational chart." }, { status: 500 });
  }
}

