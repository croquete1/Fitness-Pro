import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";

// Estas variáveis são obrigatórias e devem existir em todos os ambientes:
// NEXTAUTH_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente público do Supabase (não deve ser usado no navegador se você só faz login/consulta)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Cliente administrador (SERVICE_ROLE_KEY) para leitura de roles e perfil
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  adapter: SupabaseAdapter({
    url: SUPABASE_URL,
    secret: SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    CredentialsProvider({
      name: "E‑mail & Palavra‑passe",
      credentials: {
        email: { label: "E‑mail", type: "email", placeholder: "usuario@exemplo.com" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("E‑mail e senha são obrigatórios.");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password,
        });
        if (error || !data.user) {
          throw new Error("E‑mail ou senha inválidos.");
        }
        return {
          id: data.user.id,
          email: data.user.email ?? undefined,
          name: (data.user.user_metadata as any)?.full_name ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Quando o usuário faz login, estende o token com o id
      if (user && (user as { id?: string }).id) {
        (token as any).id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      // Na sessão, cria um novo objeto com id + dados principais
      const uid = (token as any).id as string | undefined;
      session.user = {
        id: uid!,
        name: session.user?.name ?? undefined,
        email: session.user?.email ?? undefined,
        image: session.user?.image ?? undefined,
      };

      // Adiciona a role, se disponível na base (tabela 'profiles')
      if (uid && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", uid)
          .single();
        if (data?.role) {
          (session.user as any).role = data.role;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error",
  },
};
