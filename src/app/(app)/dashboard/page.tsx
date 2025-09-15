// src/app/(app)/dashboard/page.tsx
export const dynamic = 'force-dynamic';

;
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { toAppRole } from '@/lib/roles';

export default async function DashboardIndex() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.id) redirect('/login' as Route);

  const role = toAppRole(sessionUser.role) ?? 'CLIENT';
  if (role === 'ADMIN') redirect('/dashboard/admin' as Route);
  if (role === 'PT') redirect('/dashboard/pt' as Route);
  redirect('/dashboard/clients' as Route);
}
