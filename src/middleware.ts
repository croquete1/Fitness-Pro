// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Rotas privadas: apenas estas são protegidas.
 * /login e /register ficam sempre públicos.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/trainer"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // públicos
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // só protege se bater em /dashboard, /admin ou /trainer
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!needsAuth) return NextResponse.next();

  // verifica token JWT do NextAuth (sem acrescentar callbackUrl)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Aplica o middleware só às rotas de app, ignorando assets e /api (excepto /api/auth,
 * que já abrimos explicitamente acima).
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
