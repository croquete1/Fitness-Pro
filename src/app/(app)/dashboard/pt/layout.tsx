export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import SidebarPT from '@/components/layout/SidebarPT';
import AppHeader from '@/components/layout/AppHeader';

export default async function PTLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role) ?? 'CLIENT';
  if (role !== 'PT') redirect('/dashboard' as any);

  const userLabel =
    ((session as any)?.user?.name as string | undefined)?.trim() || 'PT';

  return (
    <SidebarProvider>
      <div className="fp-shell">
        <SidebarPT userLabel={userLabel} />
        <main className="fp-main">
          <AppHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
