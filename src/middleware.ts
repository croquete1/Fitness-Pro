// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // força middleware a usar a sua página de login
  },
  // Se quiser, pode adicionar callbacks.authorized aqui para RBAC;
  // deixamos simples para evitar redirecionos em cadeia.
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/trainer/:path*"],
};
