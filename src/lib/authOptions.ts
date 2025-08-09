import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

type UserRole = "cliente" | "pt" | "admin";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  },
  providers: [
    CredentialsProvider({
      name: "Email e password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        try {
          // 1) Validação determinística NO POSTGRES (evita diferenças do bcrypt em JS)
          //    O campo email é CITEXT, logo = é case-insensitive.
          const rows: Array<{ id: string; email: string; name: string | null; role: UserRole }> =
            await prisma.$queryRaw`
              select id, email, name, role
              from public.users
              where email = ${email}
                and password_hash = crypt(${password}, password_hash)
              limit 1
            `;

          const row = rows[0];
          if (!row) return null;

          // 2) Retorna o utilizador mínimo para o token
          return {
            id: row.id,
            email: row.email,
            name: row.name ?? undefined,
            role: row.role,
          } as any;
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("[auth] authorize(db-crypt) error:", err);
          }
          // Em erro interno, devolvemos null para não expor detalhes ao cliente
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id;
        (token as any).role = (user as any).role as UserRole;
        token.name = (user as any).name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role as UserRole;
        session.user.name = (token.name as string | null) ?? session.user.name;
      }
      return session;
    },
  },
  // Mantemos debug só em dev; em produção fica silencioso
  debug: process.env.NODE_ENV === "development",
};
