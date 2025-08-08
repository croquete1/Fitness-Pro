import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { z } from "zod";

type UserRole = "cliente" | "pt" | "admin";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email e palavra-passe",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
        });
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; name?: string | null; email?: string | null; role?: UserRole };
        if (u.id) token.uid = u.id;
        if (u.role) token.role = u.role;
        if (u.name) token.name = u.name;
        if (u.email) token.email = u.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token.uid as string | undefined) ?? "";
        (session.user as { role?: UserRole }).role = (token.role as UserRole | undefined) ?? "cliente";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
