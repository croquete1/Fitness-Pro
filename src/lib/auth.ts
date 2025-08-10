// src/lib/auth.ts — exporta `authOptions` para uso em /api/auth/[...nextauth]/route.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email e Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, name: true, email: true, passwordHash: true, role: true },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? user.email, email: user.email, role: user.role ?? "cliente" } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore — propagamos role para o token
        token.role = (user as any).role ?? token.role ?? "cliente";
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore — role disponível no client
      session.user.role = (token as any).role ?? "cliente";
      return session;
    },
    async redirect({ url, baseUrl }) {
      const isRelative = url.startsWith("/");
      const isSameOrigin = url.startsWith(baseUrl);
      const nextUrl = isRelative ? new URL(url, baseUrl) : isSameOrigin ? new URL(url) : new URL(baseUrl);

      // Evitar cair em /admin por omissão e normalizar pós-login
      if (
        nextUrl.pathname === "/" ||
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/admin" ||
        nextUrl.pathname.startsWith("/admin/")
      ) {
        nextUrl.pathname = "/dashboard";
        nextUrl.search = "";
      }

      if (nextUrl.pathname === "/dashboard" && !nextUrl.searchParams.get("tab")) {
        nextUrl.searchParams.set("tab", "overview");
      }
      return nextUrl.toString();
    },
  },
};

export default authOptions;
