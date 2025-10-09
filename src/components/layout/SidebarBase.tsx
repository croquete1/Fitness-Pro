'use client';

import * as React from 'react';
import { Box, Drawer, Paper } from '@mui/material';
import { useSidebar } from './SidebarProvider';

type Props = { header?: React.ReactNode; children?: React.ReactNode };

const RAIL = 64;
const PANEL = 260;

export default function SidebarBase({ header, children }: Props) {
  const { collapsed, isMobile, mobileOpen, closeMobile, peek, setPeek } = useSidebar();

  React.useEffect(() => {
    if (!collapsed && peek) {
      setPeek(false);
    }
  }, [collapsed, peek, setPeek]);

  const isRail = collapsed && !peek;
  const width = isRail ? RAIL : PANEL;

  const hoverHandlers = collapsed
    ? {
        onMouseEnter: () => setPeek(true),
        onMouseLeave: () => setPeek(false),
        onFocus: () => setPeek(true),
        onBlur: () => setPeek(false),
      }
    : {};

  const content = (
    <Paper
      elevation={0}
      square
      sx={{
        width,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100dvh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.standard }),
      }}
      data-collapsed={collapsed ? '1' : '0'}
      data-peek={peek ? '1' : '0'}
      {...hoverHandlers}
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
