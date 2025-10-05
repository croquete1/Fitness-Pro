'use client';

import * as React from 'react';

// Wrappers híbridos (SSR inicial + SWR refresh)
import SidebarAdminHydrated from '@/components/layout/SidebarAdminHydrated';
import SidebarClientHydrated from '@/components/layout/SidebarClientHydrated';

// Sidebars base (caso não envies contagens iniciais, rendem sem badges)
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarClient from '@/components/layout/SidebarClient';

// Se tiveres uma sidebar específica para PT, importa-a aqui.
// Caso não exista, usamos a de cliente como fallback.
// import SidebarPT from '@/components/layout/SidebarPT';

type AdminCounts = { approvalsCount: number; notificationsCount: number };
type ClientCounts = { messagesCount: number; notificationsCount: number };

export default function RoleSidebar({
  role,
  // userLabel já não é usado nas sidebars para evitar duplicação com o AppHeader
  // Mantemos a prop para compatibilidade, mas não a passamos mais.
  userLabel, // eslint-disable-line @typescript-eslint/no-unused-vars
  initialCounts,
}: {
  role?: string | null;
  userLabel?: string | null;
  /**
   * Valores SSR para os badges. Se vierem definidos, usamos os wrappers “Hydrated”.
   * Caso venham undefined, renderizamos as sidebars base (badges a 0 e sem refresh).
   */
  initialCounts?: {
    admin?: AdminCounts;
    client?: ClientCounts;
  };
}) {
  const r = String(role || 'client').toUpperCase();

  // ADMIN
  if (r === 'ADMIN') {
    if (initialCounts?.admin) {
      return <SidebarAdminHydrated initial={initialCounts.admin} />;
    }
    // fallback sem contagens SSR
    return <SidebarAdmin />;
  }

  // TRAINER/PT (se houver componente próprio, descomenta e usa-o)
  if (r === 'TRAINER' || r === 'PT') {
    // return <SidebarPT />;
    // fallback: usa a sidebar de cliente
    if (initialCounts?.client) {
      return <SidebarClientHydrated initial={initialCounts.client} />;
    }
    return <SidebarClient />;
  }

  // CLIENT (default)
  if (initialCounts?.client) {
    return <SidebarClientHydrated initial={initialCounts.client} />;
  }
  return <SidebarClient />;
}
