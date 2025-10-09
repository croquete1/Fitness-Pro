'use client';

import * as React from 'react';
import { Box, Container } from '@mui/material';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import {
  HeaderCountsProvider,
  type HeaderCounts,
  type Role,
} from '@/components/header/HeaderCountsContext';
import type { DashboardCountsSnapshot } from '@/types/dashboard-counts';

type Props = {
  /** 'ADMIN' | 'TRAINER' | 'CLIENT' | null */
  role?: Role | string | null;
  /** Texto curto no topo (ex.: nome do utilizador) */
  userLabel?: string | null;
  /** Contagens iniciais (header + sidebars) hidratadas via SSR */
  initialCounts?: DashboardCountsSnapshot;
  children: React.ReactNode;
};

function normalizeRole(value: Props['role']): Role {
  const asString = String(value ?? 'CLIENT').toUpperCase();
  if (asString === 'ADMIN' || asString === 'TRAINER' || asString === 'CLIENT') {
    return asString;
  }
  return 'CLIENT';
}

/**
 * DashboardFrame
 * - Fornece o Header com badges (via HeaderCountsProvider)
 * - Layout com sidebar à esquerda (desktop) e conteúdo à direita
 * - Tudo client-side e MUI-puro
 */
export default function DashboardFrame({
  role = null,
  userLabel,
  initialCounts,
  children,
}: Props) {
  const normalizedRole = React.useMemo(() => normalizeRole(role), [role]);

  const headerInitial = React.useMemo<Partial<HeaderCounts>>(() => {
    if (!initialCounts) return {};
    if (initialCounts.header) return initialCounts.header;

    if (normalizedRole === 'ADMIN' && initialCounts.admin) {
      return {
        approvalsCount: initialCounts.admin.approvalsCount,
        notificationsCount: initialCounts.admin.notificationsCount,
      } satisfies Partial<HeaderCounts>;
    }

    if (normalizedRole === 'CLIENT' && initialCounts.client) {
      return {
        messagesCount: initialCounts.client.messagesCount,
        notificationsCount: initialCounts.client.notificationsCount,
      } satisfies Partial<HeaderCounts>;
    }

    if (normalizedRole === 'TRAINER') {
      const snapshot: Partial<HeaderCounts> = {};
      if (initialCounts.client) {
        snapshot.messagesCount = initialCounts.client.messagesCount;
        snapshot.notificationsCount = initialCounts.client.notificationsCount;
      }
      return snapshot;
    }

    return {};
  }, [initialCounts, normalizedRole]);

  return (
    <HeaderCountsProvider
      role={normalizedRole}
      /** ✅ Corrigido: NÃO passamos `role` dentro de `initial` */
      initial={headerInitial}
    >
      <Box
        sx={{
          minHeight: '100dvh',
          bgcolor: 'background.default',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
        }}
      >
        {/* Header com badges e toggle de tema (ThemeToggleButton) */}
        <AppHeader userLabel={userLabel ?? undefined} />

        {/* Corpo: sidebar + conteúdo */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
            gap: 0,
          }}
        >
          {/* Sidebar só em md+ (no mobile usas o menu do AppHeader/SidebarProvider) */}
          <Box component="aside" sx={{ display: { xs: 'none', md: 'block' } }}>
            <RoleSidebar role={normalizedRole} initialCounts={initialCounts} />
          </Box>

          <Box component="main" sx={{ p: 2 }}>
            <Container maxWidth="lg" disableGutters>
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </HeaderCountsProvider>
  );
}
