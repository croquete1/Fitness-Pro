'use client';

import * as React from 'react';
import { Box, Drawer, Paper } from '@mui/material';
import { useTheme, type Theme } from '@mui/material/styles';
import { useSidebar } from './SidebarProvider';

type Props = { header?: React.ReactNode; children?: React.ReactNode };

const RAIL = 64;
const PANEL = 260;

export default function SidebarBase({ header, children }: Props) {
  const { collapsed, isMobile, mobileOpen, closeMobile, peek, setPeek } = useSidebar();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  React.useEffect(() => {
    if ((!collapsed || isMobile) && peek) {
      setPeek(false);
    }
  }, [collapsed, isMobile, peek, setPeek]);

  const isRail = !isMobile && collapsed && !peek;
  const width = isMobile ? PANEL : isRail ? RAIL : PANEL;

  const hoverHandlers = !isMobile && collapsed
    ? {
        onMouseEnter: () => setPeek(true),
        onMouseLeave: () => setPeek(false),
        onFocus: () => setPeek(true),
        onBlur: () => setPeek(false),
      }
    : {};

  const dataCollapsed = isRail ? '1' : '0';
  const dataPeek = !isMobile && peek ? '1' : '0';

  const surfaceStyles = {
    width,
    borderRight: 1,
    borderColor: 'divider' as const,
    bgcolor: 'background.paper',
    backgroundImage: isLight
      ? 'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(236,244,255,0.88) 50%, rgba(238,242,255,0.84) 100%)'
      : 'linear-gradient(170deg, rgba(11,17,28,0.9) 0%, rgba(14,23,38,0.88) 45%, rgba(12,21,34,0.9) 100%)',
    backdropFilter: 'saturate(160%) blur(18px)',
    WebkitBackdropFilter: 'saturate(160%) blur(18px)',
    boxShadow: isLight
      ? '0 28px 60px rgba(15,23,42,0.18)'
      : '0 32px 70px rgba(2,6,23,0.55)',
    height: '100dvh',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    transition: (t: Theme) =>
      t.transitions.create('width', { duration: t.transitions.duration.standard }),
  } as const;

  const content = (
    <Paper
      elevation={0}
      square
      sx={{
        ...surfaceStyles,
      }}
      data-collapsed={dataCollapsed}
      data-peek={dataPeek}
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
        PaperProps={{
          sx: {
            ...surfaceStyles,
          },
        }}
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
