// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export type AppUser = {
  id: string;
  email: string;
  role: "admin" | "trainer" | "user" | "pending";
};

// ⚠️ Placeholder de verificação — substitui por validação real (DB/Prisma)
async function verifyUser(username: string, password: string): Promise<AppUser | null> {
  if (username === process.env.SEED_ADMIN_EMAIL && password === (process.env.SEED_ADMIN_PASSWORD || "")) {
    return { id: "admin-1", email: username, role: "admin" };
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await verifyUser(credentials.email, credentials.password);
        return user as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role || "user";
      return token;
    },
    async session({ session, token }) {
      (session as any).role = token.role || "user";
      return session;
    },
    async redirect({ url, baseUrl }) {
      // manter same-origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login", // fornecemos esta página abaixo
  },
};
