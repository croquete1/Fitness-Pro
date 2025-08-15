// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Status, Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 dias
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        // email é CITEXT no schema -> comparação case-insensitive
        const user = await prisma.user.findFirst({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            status: true,
          },
        });
        if (!user) return null;

        // password
        const hash = user.passwordHash || "";
        const ok = hash ? await compare(password, hash) : false;
        if (!ok) return null;

        // status tem de ser ACTIVE
        if (user.status !== Status.ACTIVE) {
          // não atirar erro -> devolvemos null para 401 controlado
          return null;
        }

        // devolve “user” mínimo para JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role as Role,
          status: user.status as Status,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // em caso de erro, volta ao login
  },
  callbacks: {
    async jwt({ token, user }) {
      // mete role/status no token após login
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      // expõe role/status na sessão do cliente
      (session as any).user.role = token.role;
      (session as any).user.status = token.status;
      return session;
    },
  },
};
