// src/app/(app)/dashboard/pt/layout.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { AppRole } from '@/lib/roles';
import { toAppRole } from '@/lib/roles';

import SidebarProvider from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import MobileTopBar from '@/components/layout/MobileTopBar';

export default async function PTLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (toAppRole(session?.user?.role) ?? 'CLIENT') as AppRole;
  const userLabel = (session?.user?.name ?? session?.user?.email ?? 'Utilizador') as string;

  // Guard: apenas ADMIN ou PT
  if (role !== 'ADMIN' && role !== 'PT') {
    if (!session?.user?.id) redirect('/login');
    redirect('/dashboard');
  }

  return (
    <SidebarProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
        <aside>
          <RoleSidebar role={role} userLabel={userLabel} />
        </aside>

        <section style={{ minWidth: 0 }}>
          <MobileTopBar title="PT • Painel" />
          <div className="app-shell">{children}</div>
        </section>
      </div>
    </SidebarProvider>
  );
}
