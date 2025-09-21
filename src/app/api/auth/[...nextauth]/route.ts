// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';       // evitar Edge para bcryptjs

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
