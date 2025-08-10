import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";

// Aceita valores legacy em minúsculas e devolve o enum do Prisma
function toRole(value: unknown): Role {
  const v = String(value ?? "").toUpperCase();
  if (v === "ADMIN" || v === "PT" || v === "CLIENT") return v as Role;
  if (v === "CLIENTE") return "CLIENT";
  // fallback seguro
  return "CLIENT";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: { id: true, email: true, name: true, passwordHash: true, role: true },
        });
        if (!user) return null;

        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: toRole(user.role), // <- garante enum
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = toRole((user as any).role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = toRole(token.role);
      }
      return session;
    },
  },
};
