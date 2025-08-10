// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Nota: não importar Role do Prisma no middleware (Edge).
type TokenRole = "CLIENT" | "TRAINER" | "ADMIN" | undefined;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Públicos / NextAuth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const role = (token?.role as TokenRole) ?? undefined;

  const isPrivate =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/trainer" || // caso exista esta rota
    pathname.startsWith("/trainer/") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/dashboard/trainer") || // caso renomes
    pathname.startsWith("/dashboard/tainer");    // compat. com diretório atual

  // Anónimo -> privado
  if (!isAuth && isPrivate) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  // Já autenticado -> /login
  if (isAuth && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  // Guardas por role
  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
  if (isAdminArea && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const isTrainerArea =
    pathname.startsWith("/trainer") ||
    pathname.startsWith("/dashboard/trainer") ||
    pathname.startsWith("/dashboard/tainer");
  if (isTrainerArea && !(role === "TRAINER" || role === "ADMIN")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Evita passar no middleware as rotas estáticas e do next-auth
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
