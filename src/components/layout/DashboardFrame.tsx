'use client';

import * as React from 'react';
import { Box, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import {
  HeaderCountsProvider,
  type HeaderCounts,
} from '@/components/header/HeaderCountsContext';

type Props = {
  /** 'ADMIN' | 'TRAINER' | 'CLIENT' | null */
  role?: string | null;
  /** Texto curto no topo (ex.: nome do utilizador) */
  userLabel?: string | null;
  /** Contagens iniciais para hidratar os badges do header (opcional) */
  initialCounts?: Partial<HeaderCounts>;
  children: React.ReactNode;
};

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
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const adminInitial = initialCounts
    ? {
        approvalsCount: initialCounts.approvalsCount ?? 0,
        notificationsCount: initialCounts.notificationsCount ?? 0,
      }
    : undefined;

  const audienceInitial = initialCounts
    ? {
        messagesCount: initialCounts.messagesCount ?? 0,
        notificationsCount: initialCounts.notificationsCount ?? 0,
      }
    : undefined;

  return (
    <HeaderCountsProvider
      role={(role as any) ?? null}
      /** ✅ Corrigido: NÃO passamos `role` dentro de `initial` */
      initial={initialCounts ?? {}}
    >
      <Box
        sx={{
          minHeight: '100dvh',
          bgcolor: isLight ? 'transparent' : 'background.default',
          backgroundImage: isLight
            ? 'linear-gradient(180deg, #f7fbff 0%, #f1f5ff 45%, #eef2ff 100%)'
            : undefined,
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
            <RoleSidebar
              role={role}
              initialCounts={{
                admin: adminInitial,
                client: audienceInitial,
                trainer: audienceInitial,
              }}
            />
          </Box>

          <Box
            component="main"
            sx={{
              p: 2,
              backgroundColor: isLight ? 'transparent' : undefined,
            }}
          >
            <Container maxWidth="lg" disableGutters>
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </HeaderCountsProvider>
  );
}
