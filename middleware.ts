// src/middleware.ts
export { default } from "next-auth/middleware";

/**
 * Protege rotas que exigem autenticação.
 * Nota:
 * - Não intercepta /api/auth nem assets.
 * - A verificação de papéis (admin/pt/cliente) continua a ser feita
 *   nos layouts/páginas (ex.: /admin/layout.tsx).
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/trainer/:path*",
  ],
};
