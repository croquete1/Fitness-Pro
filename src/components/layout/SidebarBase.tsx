'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Drawer, IconButton, Tooltip, Avatar, List } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useSidebar } from './SidebarProvider';

type Props = { header?: React.ReactNode; children: React.ReactNode };

const RAIL = 64;
const PANEL = 260;

export default function SidebarBase({ children }: Props) {
  const { collapsed, isMobile, mobileOpen, closeMobile, toggleCollapse } = useSidebar();

  // Cabeçalho mínimo: só o logótipo (o nome fica no header)
  const Head = (
    <Box sx={{ px: 1.25, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Avatar src="/logo.png" alt="Fitness Pro" sx={{ width: 30, height: 30, fontWeight: 800 }}>FP</Avatar>
      </Link>
      {/* toggle fica NA sidebar */}
      <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'}>
        <IconButton size="small" onClick={toggleCollapse} sx={{ ml: 0.5 }}>
          {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  const Content = (
    <Box sx={{
      width: collapsed ? RAIL : PANEL,
      bgcolor: 'background.paper',
      borderRight: 1, borderColor: 'divider',
      height: '100dvh', position: 'sticky', top: 0,
      display: 'grid', gridTemplateRows: 'auto 1fr', gap: 0.5,
    }}>
      {Head}
      <Box sx={{ overflow: 'auto' }}>
        <List dense disablePadding sx={{ px: collapsed ? 0.5 : 1, py: 0.5, gap: 0.5, display: 'grid' }}>
          {children}
        </List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer open={mobileOpen} onClose={closeMobile} PaperProps={{ sx: { width: PANEL } }}>
        {Content}
      </Drawer>
    );
  }
  return Content;
}
