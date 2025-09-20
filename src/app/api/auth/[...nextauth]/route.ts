// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// ⚠️ Não exportes mais nada daqui (sem authOptions, sem helpers)
export { handler as GET, handler as POST };
