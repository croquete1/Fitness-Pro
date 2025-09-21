// src/app/(app)/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { roleToHomePath } from '@/types/auth';

export default async function DashboardIndex() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) {
    redirect(`/login?next=${encodeURIComponent('/dashboard')}`);
  }

  const role = (sessionUser.user as any)?.role as string | undefined;
  redirect(roleToHomePath(role));
}
