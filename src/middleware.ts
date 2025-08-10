import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Recursos públicos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  // Rotas privadas
  const isPrivate =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/trainer" ||
    pathname.startsWith("/trainer/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (!isAuth && isPrivate) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  if (isAuth && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  const role = (token as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

  // RBAC
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/trainer") && !(role === "ADMIN" || role === "TRAINER")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
