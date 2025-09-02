import type { ReactNode } from 'react';
import RoleSidebar from '@/components/layout/RoleSidebar';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Sidebar com botão de expandir/compactar */}
      <RoleSidebar />

      {/* Content alinhado à sidebar (usa --sidebar-w) */}
      <div className="app-shell">
        <header className="app-header">
          <h1 style={{ margin: 0, fontSize: 16 }}>Admin</h1>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </>
  );
}