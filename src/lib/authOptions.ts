import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'email' }, token: { label: 'Token', type: 'text' } },
      async authorize(credentials) {
        // Se usas Supabase Auth, normalmente não autenticas aqui.
        // Devolve null para evitar login por esta via.
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
};
