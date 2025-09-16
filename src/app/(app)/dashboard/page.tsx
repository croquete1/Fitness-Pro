// src/app/(app)/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';

export default async function DashboardIndex() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) {
    redirect('/login');
  }

  const role = (toAppRole(sessionUser.user.role) ?? 'CLIENT') as AppRole;

  if (role === 'ADMIN') {
    redirect('/dashboard/admin');
  } else if (role === 'PT') {
    redirect('/dashboard/pt');
  } else {
    // CLIENT (ou fallback)
    redirect('/dashboard/clients');
  }
}
