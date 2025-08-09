// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // usa a sua página de login
  },
  callbacks: {
    /**
     * Allowlist de rotas públicas:
     * - /login e /register devem ser sempre acessíveis
     * - /api/auth é do NextAuth
     * O resto (incluindo "/") exige token (sessão).
     */
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;

      // rotas públicas (não exigem sessão)
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth") || // endpoints de auth
        pathname === "/favicon.ico"
      ) {
        return true;
      }

      // tudo o resto é privado (inclui "/")
      return !!token;
    },
  },
});

export const config = {
  // Aplica o middleware a todas as rotas de app, exceto:
  // - /api (a não ser /api/auth, que deixámos autorizado acima)
  // - assets estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
