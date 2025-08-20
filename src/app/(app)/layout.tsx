import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import Sidebar from '@/components/Sidebar';
import AppHeader from '@/components/layout/AppHeader';
import SbToggle from '@/components/layout/SbToggle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions).catch(() => null);
  const role = String(
    (session as any)?.user?.role ?? (session as any)?.role ?? 'CLIENT'
  ).toUpperCase();

  return (
    <div className="fp-shell">
      <aside className="fp-sidebar">
        <div className="fp-sb-head">
          <div className="fp-sb-brand">
            <span className="logo">HMS</span>
            <strong>Fitness Pro</strong>
          </div>
          <div className="fp-sb-actions">
            {/* botão cliente; nada é passado por props */}
            <SbToggle />
          </div>
        </div>

        <Sidebar role={role} />
      </aside>

      <div className="fp-content">
        <header className="fp-header">
          <div className="fp-header-inner">
            <div />
            <AppHeader />
          </div>
        </header>

        <main className="fp-main">{children}</main>
      </div>
    </div>
  );
}
