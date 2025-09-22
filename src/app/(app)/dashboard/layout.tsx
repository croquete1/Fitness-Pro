// src/app/(app)/dashboard/layout.tsx
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) redirect('/login');

  // toAppRole já normaliza para 'ADMIN' | 'PT' | 'CLIENT'
  const role = (toAppRole(user.role) ?? 'CLIENT') as AppRole;

  const sb = createServerClient();
  const { data: prof } = await sb.from('profiles').select('name').eq('id', user.id).maybeSingle();
  const userLabel = prof?.name ?? user.name ?? user.email ?? 'Utilizador';

  let sidebar: React.ReactNode;
  if (role === 'ADMIN') sidebar = <SidebarAdmin userLabel={userLabel} />;
  else if (role === 'PT') sidebar = <SidebarPT userLabel={userLabel} />;
  else sidebar = <SidebarClient userLabel={userLabel} />;

  return <DashboardShell sidebar={sidebar}>{children}</DashboardShell>;
}
