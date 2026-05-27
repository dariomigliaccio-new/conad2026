import { type NextRequest } from "next/server";
import { readContent, writeContent } from "@/lib/content";

type Ctx = { params: Promise<{ section: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { section } = await params;
  try {
    const data = await readContent(section);
    return Response.json(data);
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { section } = await params;
  try {
    const body = await req.json();
    const { github } = await writeContent(section, body);
    return Response.json({ ok: true, github });
  } catch {
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}
