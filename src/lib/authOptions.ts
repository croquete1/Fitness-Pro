// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { z } from "zod";

type UserRole = "cliente" | "pt" | "admin";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

type AppToken = JWT & {
  uid?: string;
  role?: UserRole;
  name?: string;
  email?: string;
};

export const authOptions: NextAuthOptions = {
  // Ativamos JWT para sessões sem Adapter (mais leve)
  session: { strategy: "jwt" },

  // Página de login dedicada
  pages: { signIn: "/login" },

  // Providers
  providers: [
    Credentials({
      name: "Email e palavra-passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(raw) {
        // Validação de entrada
        const parsed = credentialsSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
        });
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Métricas de latência (dev only)
        const t0 = Date.now();

        // Selecionamos apenas o necessário
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
          },
        });

        const t1 = Date.now();

        let ok = false;
        if (user?.passwordHash) {
          ok = await compare(password, user.passwordHash);
        }

        const t2 = Date.now();

        if (process.env.NODE_ENV === "development") {
          // Ex.: [auth] findUnique=180ms compare=95ms total=275ms
          console.log(
            `[auth] findUnique=${t1 - t0}ms compare=${t2 - t1}ms total=${t2 - t0}ms`
          );
        }

        if (!user || !ok) return null;

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          role: (user.role as UserRole) ?? "cliente",
        };
      },
    }),
  ],

  // Callbacks para propagar dados ao token/sessão
  callbacks: {
    async jwt({ token, user }) {
      const t = token as AppToken;

      if (user) {
        // user vem do authorize() acima
        const u = user as {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: UserRole;
        };

        if (u.id) t.uid = u.id;
        if (u.role) t.role = u.role;
        if (u.name) t.name = u.name ?? undefined;
        if (u.email) t.email = u.email ?? undefined;
      }

      return t;
    },

    async session({ session, token }) {
      // Garantimos id e role no session.user
      const t = token as AppToken;

      if (session.user) {
        (session.user as { id?: string }).id = t.uid ?? "";
        (session.user as { role?: UserRole }).role = t.role ?? "cliente";
        // name/email já vêm preenchidos pelo NextAuth, mas alinhamos com o token se existir
        if (t.name) session.user.name = t.name;
        if (t.email) session.user.email = t.email;
      }

      return session;
    },

    // (Opcional) Sanitizar redirects externos
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        // Permite apenas o mesmo host (evita open redirects)
        if (u.origin === baseUrl) return u.toString();
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },

  // Segredo da aplicação (definido em .env/.env.local)
  secret: process.env.NEXTAUTH_SECRET,

  // Logs úteis em desenvolvimento
  debug: process.env.NODE_ENV === "development",
};
