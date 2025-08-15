// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Páginas públicas
  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Token NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  // Se não autenticado e a tentar /dashboard → /login
  if (!isAuth && pathname.startsWith("/dashboard")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  // Se autenticado e a tentar / ou /login /register → /dashboard
  if (isAuth && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  // RBAC
  const role = (token as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/dashboard/trainer") && !(role === "ADMIN" || role === "TRAINER")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Executa em tudo EXCEPTO _next static/image, favicon e API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
