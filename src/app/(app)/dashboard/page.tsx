// src/app/(app)/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import type { Route } from 'next';

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;

  if (!user?.id) {
    redirect('/login' as Route);
  }

  const role = toAppRole(user.role) ?? 'CLIENT';

  const dest =
    role === 'ADMIN'
      ? ('/dashboard/admin' as Route)
      : role === 'PT'
      ? ('/dashboard/pt' as Route)
      : ('/dashboard/clients' as Route);

  redirect(dest);
}
