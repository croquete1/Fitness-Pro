// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Recursos públicos — deixam passar
  if (
    pathname.startsWith("/_next") ||         // assets do Next
    pathname.startsWith("/favicon") ||       // favicon
    pathname.startsWith("/api/auth") ||      // rotas do NextAuth
    pathname === "/" ||                      // landing
    pathname === "/login" ||                 // página de login (trataremos redirecionamento abaixo)
    pathname === "/register"                 // se tiveres página pública de registo
  ) {
    return NextResponse.next();
  }

  // Token JWT do NextAuth (precisa de NEXTAUTH_SECRET definido)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  // Rotas privadas (exigem sessão)
  const isPrivate =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/trainer" ||
    pathname.startsWith("/trainer/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  // 1) Anónimo a tentar rota privada → enviar para /login com callback
  if (!isAuth && isPrivate) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  // 2) Autenticado a ir a /login → enviar para /dashboard
  if (isAuth && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  // 3) Guardas por role apenas nas rotas que exigem
  //    (o token.role vem das callbacks do NextAuth; aqui usamos strings MAIÚSCULAS)
  const role = (token as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

  // /admin → só ADMIN
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // /trainer → ADMIN ou TRAINER
  if (pathname.startsWith("/trainer")) {
    if (!(role === "ADMIN" || role === "TRAINER")) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Caso contrário, segue
  return NextResponse.next();
}

// Aplica o middleware a “tudo” excepto estáticos/imagens
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
