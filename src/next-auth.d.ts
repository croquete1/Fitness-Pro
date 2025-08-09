// src/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "cliente" | "pt" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** id do utilizador (NextAuth já usa `sub`; mantemos opcional) */
    id?: string;
    role?: "cliente" | "pt" | "admin";
  }
}

export {};
