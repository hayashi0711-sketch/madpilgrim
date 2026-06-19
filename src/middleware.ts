import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "mp_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (expected && session === expected) return NextResponse.next();

  const loginUrl = new URL("/admin-login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/admin/:path*"
};
