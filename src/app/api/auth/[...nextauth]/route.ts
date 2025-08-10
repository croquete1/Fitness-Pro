import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // necessário para usar bcryptjs

const providers = [
  CredentialsProvider({
    name: "Email e Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;

      // Procura utilizador por email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { id: true, name: true, email: true, passwordHash: true, role: true },
      });
      if (!user) return null;

      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;

      return { id: user.id, name: user.name ?? user.email, email: user.email, role: user.role } as any;
    },
  }),
];

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = (user as any).role ?? token.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user.role = (token as any).role ?? "user";
      return session;
    },
    async redirect({ url, baseUrl }) {
      const isRelative = url.startsWith("/");
      const isSameOrigin = url.startsWith(baseUrl);
      const nextUrl = isRelative ? new URL(url, baseUrl) : isSameOrigin ? new URL(url) : new URL(baseUrl);

      // Força dashboard após login e evita /admin por omissão
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };