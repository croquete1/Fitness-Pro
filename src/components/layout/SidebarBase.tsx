'use client';

import * as React from 'react';
import { Box, Drawer, Paper } from '@mui/material';
import { useSidebar } from './SidebarProvider';

type Props = { header?: React.ReactNode; children?: React.ReactNode };

const RAIL = 64;
const PANEL = 260;

export default function SidebarBase({ header, children }: Props) {
  const { collapsed, isMobile, mobileOpen, closeMobile } = useSidebar();

  const content = (
    <Paper
      elevation={0}
      square
      sx={{
        width: collapsed ? RAIL : PANEL,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100dvh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.standard }),
        // Hover-peak quando colapsada (desktop)
        ...(collapsed && {
          '&:hover': {
            width: PANEL,
          },
        }),
      }}
    >
      <Box sx={{ px: 1.25, py: 1 }}>{header}</Box>
      <Box sx={{ minHeight: 0, overflow: 'auto' }}>{children}</Box>
    </Paper>
  );

  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={closeMobile}
        PaperProps={{ sx: { width: PANEL, borderRight: 1, borderColor: 'divider' } }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Box component="aside" sx={{ position: 'sticky', top: 0, height: '100dvh' }}>
      {content}
    </Box>
  );
}
