// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

type UserRole = "cliente" | "pt" | "admin";

export const authOptions: NextAuthOptions = {
  // JWT mantém o handshake leve e evita acessos extra ao DB por sessão
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 dias
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email e password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Uma única query + compare → nada de joins/campos supérfluos
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const t0 = Date.now();
        const user = await prisma.user.findUnique({
          where: { email }, // índice/unique no email (ver secção SQL/CITEXT abaixo)
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
          },
        });
        const t1 = Date.now();

        const ok = !!user?.passwordHash && (await compare(password, user.passwordHash));
        const t2 = Date.now();

        if (process.env.NODE_ENV === "development") {
          console.log(`[auth] findUnique=${t1 - t0}ms compare=${t2 - t1}ms total=${t2 - t0}ms`);
        }

        if (!user || !ok) return null;

        // Devolve apenas o necessário; o resto via token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    // Colamos os dados mínimos no token
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id; // garante id no token
        (token as any).role = (user as any).role as UserRole;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    // E refletimos no session.user
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role as UserRole;
        session.user.name = (token.name as string | null) ?? session.user.name;
      }
      return session;
    },
    // Redireção pós-login simples e consistente
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        // Evita redireções externas
        if (target.origin !== baseUrl) return baseUrl;
        // Se veio de /login ou /, manda para dashboard
        if (target.pathname === "/login" || target.pathname === "/") return `${baseUrl}/dashboard`;
        return target.toString();
      } catch {
        return baseUrl;
      }
    },
  },
  // Evita chamadas automáticas de debug em produção
  debug: process.env.NODE_ENV === "development",
};
