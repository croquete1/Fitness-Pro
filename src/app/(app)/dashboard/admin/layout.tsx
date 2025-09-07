// src/app/(app)/dashboard/admin/layout.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import { SidebarProvider } from '@/components/layout/SidebarBase';

function AdminShell({ children, userLabel }: { children: React.ReactNode; userLabel: string }) {
  'use client';
  return (
    <SidebarProvider>
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <SidebarAdmin userLabel={userLabel} />
        </aside>
        <main className="dash-content">{children}</main>
      </div>
    </SidebarProvider>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');
  if ((toAppRole(user?.role) ?? 'CLIENT') !== 'ADMIN') redirect('/dashboard');
  const userLabel = `Admin ${user.name ?? user.email ?? ''}`;
  return <AdminShell userLabel={userLabel}>{children}</AdminShell>;
}
