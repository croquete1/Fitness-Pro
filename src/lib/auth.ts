// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // garante consistência em prod
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

        // email é CITEXT na BD → comparação case-insensitive no Postgres
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

        // bcrypt compatível com hashes do pgcrypto ($2a/$2b/$2y)
        const hash = user.passwordHash || "";
        const passOk = hash ? await compare(password, hash) : false;
        if (!passOk) return null;

        // 👇 Tolerante a dados legados (ex.: 'active' minúsculo)
        const statusOk = String(user.status).toUpperCase() === "ACTIVE";
        if (!statusOk) return null;

        // devolve um objeto user mínimo; id tem de ser string
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,     // mantemos no token/sessão
          status: user.status, // idem
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.role = token.role;
      (session as any).user.status = token.status;
      return session;
    },
  },
};

export default authOptions;
