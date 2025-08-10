import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string; // "cliente" por omissão
    } & DefaultSession["user"]; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
