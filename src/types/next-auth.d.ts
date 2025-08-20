import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "admin" | "pt" | "client";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: "admin" | "pt" | "client";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "pt" | "client";
    uid?: string;
  }
}
