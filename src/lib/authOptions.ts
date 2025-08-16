// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role, Status } from "@prisma/client";

// Em alguns ambientes podes ter hashes "$2y$" (PHP/pgcrypto) ou "$2b$".
// O bcryptjs entende "$2a$" e "$2b$". Este normalizador evita arestas.
function normalizeBcrypt(hash: string) {
  if (!hash) return hash;
  if (hash.startsWith("$2y$")) return hash.replace("$2y$", "$2a$");
  return hash;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.trim().toLowerCase();
          const password = credentials?.password ?? "";
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) return null;

          // Bloqueia apenas contas não ativas
          if (user.status === Status.PENDING || user.status === Status.SUSPENDED) {
            throw new Error(String(user.status)); // será mostrado na UI
          }

          const ok = await compare(password, normalizeBcrypt(user.passwordHash));
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.email,
            role: user.role as Role,
            status: user.status as Status,
          } as any;
        } catch (e) {
          // Pequeno log (vê em Vercel → Logs)
          console.warn("[authorize] erro:", e);
          throw e;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
};
