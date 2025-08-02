// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "o@exemplo.pt" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Login real com Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data?.user) return null;

        // Recuperar role personalizada da tabela de profiles, se existir
        let role = "client";
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();
          if (profile?.role) role = profile.role;
        } catch (e) {
          // Ignorar erro, assume "client"
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name ?? data.user.email,
          role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login?error=1",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        if ((user as any).role) token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user || {}),
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: (token as any).role ?? "client",
      };
      return session;
    },
  },
};
