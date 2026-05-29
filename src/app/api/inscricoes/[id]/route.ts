import { type NextRequest } from "next/server";
import { getRegistration, updateRegistration, deleteRegistration } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

function getCookie(req: NextRequest, name: string): string {
  const cookie = req.headers.get("cookie") ?? "";
  return cookie.split(";").find(c => c.trim().startsWith(`${name}=`))?.split("=")[1]?.trim() ?? "";
}

function isAdmin(req: NextRequest): boolean {
  return Boolean(getCookie(req, "admin_auth") && process.env.AUTH_SECRET && getCookie(req, "admin_auth") === process.env.AUTH_SECRET);
}

function isInscricoesTeam(req: NextRequest): boolean {
  return Boolean(getCookie(req, "inscricoes_auth") && process.env.INSCRICOES_SECRET && getCookie(req, "inscricoes_auth") === process.env.INSCRICOES_SECRET);
}

export async function GET(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req) && !isInscricoesTeam(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const reg = await getRegistration(Number(id));
  if (!reg) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json(reg);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req) && !isInscricoesTeam(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
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
  if (!isAdmin(req) && !isInscricoesTeam(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  await deleteRegistration(Number(id));
  return Response.json({ ok: true });
}
