// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role, Status } from "@prisma/client";

/**
 * NextAuth Options
 * - Login por credenciais (email + password)
 * - Apenas utilizadores com status ACTIVE podem entrar
 * - Sessão JWT com id e role do utilizador
 */
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email e password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toString().trim().toLowerCase();
        const password = (credentials?.password ?? "").toString();

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            passwordHash: true, // mapeado para password_hash na BD
          },
        });

        if (!user || !user.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        // Só entram contas ATIVAS
        if (user.status !== Status.ACTIVE) {
          // Isto será apanhado pela UI (ex.: página de erro do NextAuth)
          throw new Error(user.status); // "PENDING" | "SUSPENDED"
        }

        // Devolve shape mínimo; restante vai no token/callbacks
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
          status: user.status,
        } as any;
      },
    }),
  ],

  pages: {
    signIn: "/login",
    // error: "/login" // se quiseres forçar redirecionamento de erro
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // No login inicial, propaga campos para o token
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role as Role;
        token.status = (user as any).status as Status;
      }
      return token;
    },

    async session({ session, token }) {
      // Injeta no session.user aquilo que a app usa
      if (session.user) {
        (session.user as any).id = token.id as string | undefined;
        (session.user as any).role = (token.role as Role) ?? "CLIENT";
        (session.user as any).status = (token.status as Status) ?? "ACTIVE";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
