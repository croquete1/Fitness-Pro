export const dynamic = 'force-dynamic';

import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';
import { SidebarProvider } from '@/components/layout/SidebarCtx';
import type { AppRole } from '@/lib/roles';

export default function ClientShell({
  role,
  userLabel, // ← pode existir aguas passadas, mas não vamos passar ao RoleSidebar
  children,
}: {
  role: AppRole;
  userLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="fp-shell">
        {/* RoleSidebar já não espera userLabel */}
        <RoleSidebar role={role} />
        <main className="fp-main">
          <AppHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
