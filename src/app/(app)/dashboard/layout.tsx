// src/app/(app)/dashboard/layout.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import DashboardFrame from '@/components/layout/DashboardFrame';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUserSafe();

  // Sessão obrigatória
  if (!sessionUser?.user?.id) {
    redirect('/login');
  }

  // Role normalizada (TRAINER -> PT)
  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';

  // Etiqueta do utilizador para o header
  const userLabel =
    sessionUser.user.name ||
    sessionUser.user.email ||
    'Utilizador';

  return (
    <DashboardFrame role={role} userLabel={userLabel}>
      {children}
    </DashboardFrame>
  );
}
