// src/app/(app)/dashboard/layout.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import DashboardFrame from '@/components/layout/DashboardFrame';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;

  if (!user?.id) {
    redirect('/login');
  }

  const role = toAppRole(user.role) ?? 'CLIENT';
  const userLabel = user.name || user.email || 'Utilizador';

  return (
    <DashboardFrame role={role} userLabel={userLabel}>
      {children}
    </DashboardFrame>
  );
}
