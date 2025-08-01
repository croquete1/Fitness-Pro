// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }

  /** Se quiseres incluir `role`, faz assim: */
  interface Session {
    user: {
      role?: "client" | "trainer" | "admin";
    } & DefaultSession["user"] & { id: string };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** `sub` h) já contêm `id`; podes clonar se desejares: */
    id: string;
    role?: "client" | "trainer" | "admin";
  }
}
