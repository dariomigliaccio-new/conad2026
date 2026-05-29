import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { user, pass } = await req.json();

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };

  // Admin completo
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS && process.env.AUTH_SECRET) {
    const res = NextResponse.json({ ok: true, role: "admin" });
    res.cookies.set("admin_auth", process.env.AUTH_SECRET, cookieOpts);
    return res;
  }

  // Acesso restrito a inscrições
  if (user === process.env.INSCRICOES_USER && pass === process.env.INSCRICOES_PASS && process.env.INSCRICOES_SECRET) {
    const res = NextResponse.json({ ok: true, role: "inscricoes" });
    res.cookies.set("inscricoes_auth", process.env.INSCRICOES_SECRET, cookieOpts);
    return res;
  }

  return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
}
