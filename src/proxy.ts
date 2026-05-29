import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("admin_auth")?.value;
  const secret = process.env.AUTH_SECRET;
  const isAdmin = token && secret && token === secret;

  const inscToken = request.cookies.get("inscricoes_auth")?.value;
  const inscSecret = process.env.INSCRICOES_SECRET;
  const isInscricoes = inscToken && inscSecret && inscToken === inscSecret;

  if (pathname.startsWith("/admin")) {
    if (isAdmin) return NextResponse.next();
    if (isInscricoes) {
      if (pathname.startsWith("/admin/inscricoes")) return NextResponse.next();
      return NextResponse.redirect(new URL("/admin/inscricoes", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.method === "POST") {
    if (pathname.startsWith("/api/content/") || pathname === "/api/upload") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/content/:path*", "/api/upload"],
};
