// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

const DEBUG = process.env.AUTH_DEBUG === "1";
const dlog = (...args: any[]) => { if (DEBUG) console.log("[auth]", ...args); };

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
        if (!email || !password) {
          dlog("reject: missing email/password");
          return null;
        }

        // 1) lookup por CITEXT (case-insensitive por natureza)
        let user = await prisma.user.findFirst({
          where: { email },
          select: {
            id: true, email: true, name: true,
            passwordHash: true, role: true, status: true,
          },
        });

        // 1b) fallback explícito insensitive (caso a ligação/driver não respeite citext)
        if (!user) {
          user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } as any },
            select: {
              id: true, email: true, name: true,
              passwordHash: true, role: true, status: true,
            },
          });
        }

        if (!user) {
          dlog("reject: user not found for", email);
          return null;
        }
        dlog("user found:", { id: user.id, role: String(user.role), status: String(user.status) });

        // 2) compat bcrypt: normaliza $2y → $2b
        const rawHash = user.passwordHash || "";
        const hash = rawHash.startsWith("$2y$") ? ("$2b$" + rawHash.slice(4)) : rawHash;

        const passOk = hash ? await compare(password, hash) : false;
        if (!passOk) {
          dlog("reject: password mismatch for", email);
          return null;
        }

        // 3) status tem de ser ACTIVE (tolerante a maiúsculas/minúsculas)
        if (String(user.status).toUpperCase() !== "ACTIVE") {
          dlog("reject: status not ACTIVE:", String(user.status));
          return null;
        }

        dlog("login OK:", user.id);
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
