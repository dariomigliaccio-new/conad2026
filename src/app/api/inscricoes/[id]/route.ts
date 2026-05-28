import { type NextRequest } from "next/server";
import { getRegistration, updateRegistration, deleteRegistration } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

function isAdmin(req: NextRequest): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie.split(";").find(c => c.trim().startsWith("admin_auth="))?.split("=")[1]?.trim();
  return Boolean(token && process.env.AUTH_SECRET && token === process.env.AUTH_SECRET);
}

export async function GET(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const reg = await getRegistration(Number(id));
  if (!reg) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json(reg);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    await updateRegistration(Number(id), body);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  await deleteRegistration(Number(id));
  return Response.json({ ok: true });
}
