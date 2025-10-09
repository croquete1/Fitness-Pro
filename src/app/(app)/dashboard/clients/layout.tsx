import * as React from 'react';
import SidebarClientHydrated from '@/components/layout/SidebarClientHydrated';
import DashboardFrame from '@/components/layout/DashboardFrame';
import { HeaderCountsProvider } from '@/components/header/HeaderCountsContext';
import { getSBC } from '@/lib/supabase/server';

type ClientCounts = {
  messagesCount: number;
  notificationsCount: number;
};

/**
 * Obtém contagens iniciais para o cliente (SSR).
 * Robusto: em caso de erro, devolve 0s.
 */
async function getInitialClientCounts(): Promise<ClientCounts> {
  try {
    const sb = getSBC();

    // Mensagens (exemplo: contar todas; ajusta filtros conforme o teu schema)
    let messagesCount = 0;
    try {
      const { count } = await sb
        .from('messages')
        .select('id', { count: 'exact', head: true });
      messagesCount = count ?? 0;
    } catch {
      messagesCount = 0;
    }

    // Notificações não lidas (ajusta conforme o teu schema/colunas)
    let notificationsCount = 0;
    try {
      const { count } = await sb
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('read', false);
      notificationsCount = count ?? 0;
    } catch {
      notificationsCount = 0;
    }

    return { messagesCount, notificationsCount };
  } catch {
    return { messagesCount: 0, notificationsCount: 0 };
  }
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialClient = await getInitialClientCounts();

  return (
    <HeaderCountsProvider role="CLIENT" initial={initialClient}>
      <DashboardFrame>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            minHeight: '100dvh',
          }}
        >
          {/* Híbrido: SSR + refresh no cliente */}
          <SidebarClientHydrated initial={initialClient} />
          <main style={{ minWidth: 0 }}>{children}</main>
        </div>
      </DashboardFrame>
    </HeaderCountsProvider>
  );
}
