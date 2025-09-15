// src/app/(app)/dashboard/layout.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
;
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import DashboardFrame from '@/components/layout/DashboardFrame';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.id) {
    redirect('/login');
  }

  const role = toAppRole(sessionUser.role) ?? 'CLIENT';
  const userLabel = sessionUser.name || sessionUser.email || 'Utilizador';

  return (
    <DashboardFrame role={role} userLabel={userLabel}>
      {children}
    </DashboardFrame>
  );
}
