// src/lib/auth.ts
// Opções do NextAuth usadas por src/app/api/auth/[...nextauth]/route.ts
// Nota: a app autentica via Supabase; este provider serve apenas para
// satisfazer os tipos e redirecionar o fluxo para a tua página /login.

import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  // Mantemos JWT porque não estamos a guardar sessão em DB via NextAuth
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret',

  // Provider “placeholder” — não autentica ninguém, apenas cumpre a tipagem
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize() {
        // A tua app usa Supabase; aqui devolvemos null para impedir login via NextAuth
        return null;
      },
    }),
  ],

  // Redireciona utilizadores para a tua página de login
  pages: {
    signIn: '/login',
  },
};