import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("admin_auth")?.value;
  const secret = process.env.AUTH_SECRET;
  const authenticated = token && secret && token === secret;

  if (pathname.startsWith("/admin")) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (request.method === "POST") {
    if (pathname.startsWith("/api/content/") || pathname === "/api/upload") {
      if (!authenticated) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/content/:path*", "/api/upload"],
};
