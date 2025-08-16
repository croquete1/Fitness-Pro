import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role, Status } from "@prisma/client";

// Aceita hashes $2y$ (pgcrypto/PHP) e $2b$/$2a$ (bcryptjs)
function normalizeBcrypt(hash: string) {
  if (!hash) return hash;
  if (hash.startsWith("$2y$")) return hash.replace("$2y$", "$2a$");
  return hash;
}

// Tolerância temporária a bases antigas com 'APPROVED'
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

  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const status = normalizeStatus(user.status as any);
        if (status === Status.PENDING || status === Status.SUSPENDED) {
          // Isto faz o NextAuth falhar o sign-in (mostra erro amigável na UI)
          throw new Error(status);
        }

        const ok = await compare(password, normalizeBcrypt(user.passwordHash));
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
