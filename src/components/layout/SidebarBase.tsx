'use client';

import * as React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Props = {
  header?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Base visual/estrutural da sidebar.
 * - Desktop: aside “sticky” com largura animada (rail/painel)
 * - Mobile: Drawer
 * - Respeita `collapsed` do provider e faz "peek" em hover (via SidebarHoverPeeker)
 * - Coloca o botão de expandir/colapsar **na própria sidebar** (não no header)
 */
export default function SidebarBase({ header, children }: Props) {
  const theme = useTheme();
  const lgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const {
    collapsed,
    toggleCollapse,
    isMobile,
    mobileOpen,
    closeMobile,
    peek,
    railWidth,
    panelWidth,
  } = useSidebar();

  // “Peek” expande temporariamente quando estamos colapsados e o peeker ativa
  const effectiveCollapsed = collapsed && !peek;
  const width = effectiveCollapsed ? railWidth : panelWidth;

  const Content = (
    <Box
      className="fp-sidebar"
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        width,
        minWidth: width,
        height: '100dvh',
        bgcolor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        borderRight: '1px solid var(--border)',
        transition: 'width var(--sb-dur) var(--sb-ease), min-width var(--sb-dur) var(--sb-ease)',
      }}
    >
      {/* Cabeçalho da Sidebar */}
      <Box
        className="fp-sb-head"
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 1,
          px: 1.25,
          py: 1,
          minHeight: '56px',
        }}
      >
        <Box className="fp-sb-brand" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {header}
        </Box>

        {/* Botão de colapsar/expandir fica NA SIDEBAR (desktop only) */}
        {!lgDown && (
          <IconButton
            size="small"
            onClick={toggleCollapse}
            aria-label={effectiveCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            sx={{
              border: '1px solid var(--border)',
              bgcolor: 'var(--card-bg)',
              '&:hover': { bgcolor: 'var(--hover)' },
            }}
          >
            {effectiveCollapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'var(--border)' }} />

      {/* Área scrollável dos itens */}
      <Box sx={{ overflow: 'auto', p: 0.5 }}>
        {children}
      </Box>
    </Box>
  );

  // Mobile Drawer
  if (isMobile || lgDown) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={closeMobile}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: panelWidth,
            bgcolor: 'var(--sidebar-bg)',
            color: 'var(--sidebar-fg)',
            borderRight: '1px solid var(--border)',
          },
        }}
      >
        {Content}
      </Drawer>
    );
  }

  // Desktop aside “sticky” (o container pai já define a grelha)
  return (
    <Box
      component="aside"
      sx={{
        position: 'sticky',
        top: 0,
        alignSelf: 'start',
        height: '100dvh',
        zIndex: 1,
      }}
    >
      {Content}
    </Box>
  );
}
