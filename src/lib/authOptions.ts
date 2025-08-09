// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

type UserRole = "cliente" | "pt" | "admin";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email e password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              passwordHash: true,
            },
          });

          if (!user || !user.passwordHash) return null;

          const ok = await compare(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role as UserRole,
          } as any;
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("[auth] authorize error:", err);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id;
        (token as any).role = (user as any).role as UserRole;
        token.name = (user as any).name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role as UserRole;
        session.user.name = (token.name as string | null) ?? session.user.name;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redireção neutra (mantém callbackUrl e evita loops)
      try {
        const target = new URL(url, baseUrl);
        if (target.origin !== baseUrl) return baseUrl;
        return target.toString();
      } catch {
        return baseUrl;
      }

      // 👉 Se preferir redirecionar por role após login, ative este bloco e remova o return acima:
      /*
      try {
        const target = new URL(url, baseUrl);
        if (target.pathname === "/" || target.pathname === "/login" || target.pathname === "/") {
          // Exige o token, pelo que esta lógica normalmente vive melhor no client pós-login.
          // Se quiser muito fazer aqui, teria de injetar o role via callbackUrl.
          return new URL("/dashboard", baseUrl).toString();
        }
        if (target.origin !== baseUrl) return baseUrl;
        return target.toString();
      } catch {
        return baseUrl;
      }
      */
    },
  },
  debug: process.env.NODE_ENV === "development",
};
