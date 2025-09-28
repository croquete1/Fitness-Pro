'use client';

import * as React from 'react';
import { Box, Drawer, Divider } from '@mui/material';
import { useSidebar } from './SidebarProvider';

type Props = { header?: React.ReactNode; children: React.ReactNode };

export default function SidebarBase({ header, children }: Props) {
  const {
    collapsed,
    isMobile,
    mobileOpen,
    closeMobile,
    widthCollapsed,
    widthExpanded,
    peek,
  } = useSidebar();

  // quando colapsada no desktop, o “peek” expande temporariamente
  const effectiveWidth =
    isMobile ? widthExpanded : (collapsed ? (peek ? widthExpanded : widthCollapsed) : widthExpanded);

  const aside = (
    <Box
      component="aside"
      className="fp-sidebar"
      sx={{
        width: effectiveWidth,
        transition: 'width .26s var(--sb-ease, cubic-bezier(.18,.9,.22,1))',
        flexShrink: 0,
        bgcolor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100dvh',
        position: { xs: 'relative', lg: 'sticky' },
        top: { lg: 0 },
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Box className="fp-sb-head">{header}</Box>
      <Divider />
      <Box sx={{ overflow: 'auto', p: 0.5 }}>{children}</Box>
    </Box>
  );

  // Mobile: Drawer temporário
  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={closeMobile}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: widthExpanded,
            bgcolor: 'var(--sidebar-bg)',
            color: 'var(--sidebar-fg)',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {aside}
      </Drawer>
    );
  }

  // Desktop: aside fixo
  return aside;
}
