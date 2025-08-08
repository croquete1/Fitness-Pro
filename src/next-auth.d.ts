import "next-auth";
import "next-auth/jwt";

type UserRole = "cliente" | "pt" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
    };
  }
  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: UserRole;
  }
}

export {};
