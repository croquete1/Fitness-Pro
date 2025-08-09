// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  // Sem authorized custom aqui: deixamos o matcher decidir onde atua.
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/trainer/:path*",
  ],
};
