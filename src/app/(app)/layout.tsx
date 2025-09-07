// src/app/(app)/dashboard/layout.tsx  (usado pelo CLIENT)
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import SidebarClient from '@/components/layout/SidebarClient';
import { SidebarProvider } from '@/components/layout/SidebarBase';

function ClientShell({ children, userLabel }: { children: React.ReactNode; userLabel: string }) {
  'use client';
  return (
    <SidebarProvider>
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <SidebarClient userLabel={userLabel} />
        </aside>
        <main className="dash-content">{children}</main>
      </div>
    </SidebarProvider>
  );
}

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role === 'ADMIN') redirect('/dashboard/admin');
  if (role === 'PT') redirect('/dashboard/pt');
  const userLabel = user.name ?? user.email ?? 'Cliente';
  return <ClientShell userLabel={userLabel}>{children}</ClientShell>;
}
