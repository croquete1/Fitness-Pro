// src/app/(app)/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { toAppRole } from '@/lib/roles';

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role === 'ADMIN') redirect('/dashboard/admin' as Route);
  if (role === 'PT') redirect('/dashboard/pt' as Route);
  redirect('/dashboard/clients' as Route);
}
