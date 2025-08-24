// src/lib/authOptions.ts (NextAuth v4)
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role, Status } from "@prisma/client";

function normalizeBcrypt(hash: string) {
  if (!hash) return hash as any;
  return hash.startsWith("$2y$") ? hash.replace("$2y$", "$2a$") : hash;
}
function normalizeStatus(s: string | Status): Status {
  const v = String(s).toUpperCase();
  if (v === "APPROVED") return Status.ACTIVE;
  if (v === "REJECTED") return Status.SUSPENDED;
  if (v === "ACTIVE") return Status.ACTIVE;
  if (v === "PENDING") return Status.PENDING;
  return Status.SUSPENDED;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  // Cookie estável no mobile
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = creds?.email?.trim().toLowerCase();
        const password = creds?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const status = normalizeStatus(user.status as any);
        if (status === Status.PENDING || status === Status.SUSPENDED) {
          throw new Error(status); // bloqueia login se não for ACTIVE
        }

        const ok = await compare(password, normalizeBcrypt((user as any).passwordHash));
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role as Role,
          status,
        } as any;
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
