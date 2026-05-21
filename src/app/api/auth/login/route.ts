import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { user, pass } = await req.json();

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;
  const secret = process.env.AUTH_SECRET;

  if (!validUser || !validPass || !secret) {
    return NextResponse.json({ error: "Servidor não configurado" }, { status: 500 });
  }

  if (user !== validUser || pass !== validPass) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
