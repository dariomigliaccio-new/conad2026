import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("admin_auth")?.value;
  const secret = process.env.AUTH_SECRET;
  const authenticated = token && secret && token === secret;

  // Protect admin pages → redirect to login
  if (pathname.startsWith("/admin")) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Protect content write API and upload → return 401
  if (request.method === "POST") {
    if (!authenticated) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/content/:path*", "/api/upload"],
};
