// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
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

        const user = await prisma.user.findFirst({
          where: { email }, // CITEXT no Postgres → case-insensitive
          select: {
            id: true, email: true, name: true,
            passwordHash: true, role: true, status: true,
          },
        });
        if (!user) return null;

        // 🔧 bcrypt compat: normaliza $2y → $2b (pgcrypto às vezes gera $2y)
        const rawHash = user.passwordHash || "";
        const hash = rawHash.startsWith("$2y$")
          ? "$2b$" + rawHash.slice(4)
          : rawHash;

        const passOk = hash ? await compare(password, hash) : false;
        if (!passOk) return null;

        // tolerante a dados legados (ACTIVE / active)
        if (String(user.status).toUpperCase() !== "ACTIVE") return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          status: user.status,
        } as any;
      },
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
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
