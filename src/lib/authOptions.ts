// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const isProd = process.env.NODE_ENV === "production";
const prefix = isProd ? "__Secure-" : ""; // em prod precisa de HTTPS

export const authOptions: NextAuthOptions = {
  // Se usas sessions via DB troca para { strategy: 'database' }
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // importante em Vercel e para domínios dinâmicos

  // Cookies “compatíveis” com mobile: __Secure- só em HTTPS
  cookies: {
    sessionToken: {
      name: `${prefix}next-auth.session-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProd },
    },
    callbackUrl: {
      name: `${prefix}next-auth.callback-url`,
      options: { sameSite: "lax", path: "/", secure: isProd },
    },
    csrfToken: {
      name: `${prefix}next-auth.csrf-token`,
      options: { httpOnly: false, sameSite: "lax", path: "/", secure: isProd },
    },
    state: {
      name: `${prefix}next-auth.state`,
      options: { sameSite: "lax", path: "/", secure: isProd },
    },
  },

  adapter: PrismaAdapter(prisma) as any,

  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = creds?.email?.toLowerCase();
        const pass = creds?.password ?? "";
        if (!email || !pass) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const hash =
          (user as any).passwordHash ??
          (user as any).password ??
          (user as any).hashedPassword ??
          null;
        if (!hash) return null;

        const ok = await bcrypt.compare(pass, String(hash));
        if (!ok) return null;

        // devolve os campos que queres disponíveis na session/jwt
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
      if (token?.id) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },

  // opcional: ajuda a diagnosticar em dev
  debug: !isProd,
};
