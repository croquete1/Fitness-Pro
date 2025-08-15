// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteger /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    // Verificação simples: existe cookie de sessão do NextAuth?
    const hasSession =
      req.cookies.has("next-auth.session-token") || req.cookies.has("__Secure-next-auth.session-token");

    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
