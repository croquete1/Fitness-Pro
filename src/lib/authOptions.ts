// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import { Role, AccountStatus } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;

        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        // Bloquear login se ainda não aprovado
        if (user.status !== AccountStatus.APPROVED) {
          // Isto aparece como ?error=PENDING_APPROVAL na rota /api/auth/error
          throw new Error("PENDING_APPROVAL");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: user.role as Role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as Role;
      }
      return session;
    },
  },
};
