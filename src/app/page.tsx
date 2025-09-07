// src/app/page.tsx  (ÚNICO ficheiro que serve "/")
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Route } from 'next';

export default async function Home() {
  const session = await getServerSession(authOptions);
  // Se autenticado → vai para /dashboard (que reencaminha pelos roles)
  if ((session as any)?.user?.id) redirect('/dashboard' as Route);
  // Caso contrário → login
  redirect('/login' as Route);
}
