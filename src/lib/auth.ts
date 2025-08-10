import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) throw new Error("missing_credentials");

        // Email é CITEXT -> comparação insensitive
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, passwordHash: true, role: true },
        });
        if (!user) throw new Error("invalid_credentials");

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error("invalid_credentials");

        return { id: user.id, name: user.name ?? user.email, email: user.email, role: user.role ?? "cliente" } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore — propagar role
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
