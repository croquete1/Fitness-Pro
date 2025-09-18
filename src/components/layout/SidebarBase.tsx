// src/components/layout/SidebarBase.tsx
'use client';

import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  activePrefix?: string;
  exact?: boolean;
};

const WIDTH_EXPANDED = 260;
const WIDTH_COLLAPSED = 72;

export default function SidebarBase({
  items,
  header,
}: {
  items: NavItem[];
  header?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile, toggleCollapsed } = useSidebar();

  // Drawer mobile
  const mobile = (
    <Drawer
      open={mobileOpen}
      onClose={closeMobile}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', lg: 'none' },
        '& .MuiDrawer-paper': { width: WIDTH_EXPANDED },
      }}
    >
      <SidebarContent
        collapsed={false}
        items={items}
        header={header}
        onItemClick={closeMobile}
        onToggle={toggleCollapsed}
      />
    </Drawer>
  );

  // Drawer desktop (permanente)
  const desktop = (
    <Drawer
      variant="permanent"
      open
      sx={{
        display: { xs: 'none', lg: 'block' },
        '& .MuiDrawer-paper': {
          width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED,
          transition: (t) =>
            t.transitions.create('width', {
              duration: t.transitions.duration.shorter,
            }),
          overflowX: 'hidden',
          borderRight: (t) => `1px solid ${t.palette.divider}`,
        },
      }}
    >
      <SidebarContent
        collapsed={collapsed}
        items={items}
        header={header}
        onItemClick={closeMobile}
        onToggle={toggleCollapsed}
      />
    </Drawer>
  );

  return (
    <>
      {mobile}
      {desktop}
    </>
  );

  // conteúdo interno
  function SidebarContent({
    collapsed,
    items,
    header,
    onItemClick,
    onToggle,
  }: {
    collapsed: boolean;
    items: NavItem[];
    header?: React.ReactNode;
    onItemClick: () => void;
    onToggle: () => void;
  }) {
    const pathname = usePathname();

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* topo + toggle dentro da sidebar */}
        <Box
          sx={{
            px: 1.5,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              overflow: 'hidden',
              // fade do conteúdo do header quando colapsa
              opacity: collapsed ? 0 : 1,
              transition: (t) => t.transitions.create('opacity', { duration: t.transitions.duration.shorter }),
            }}
          >
            {header}
          </Box>
          <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'}>
            <IconButton size="small" onClick={onToggle}>
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        <Divider />

        <List sx={{ px: 0.5 }}>
          {items.map((it) => {
            const target = it.activePrefix ?? it.href;
            const computed = pathname ? (it.exact ? pathname === target : pathname.startsWith(target)) : false;
            const selected = it.active ?? computed;

            return (
              <ListItem key={it.href} disablePadding sx={{ display: 'block' }}>
                <Link href={it.href} onClick={onItemClick} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemButton
                    selected={selected}
                    sx={{
                      minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 1.25 : 2,
                      borderRadius: 1,
                      mx: 0.5,
                      transition: (t) =>
                        t.transitions.create(['padding', 'background-color'], {
                          duration: t.transitions.duration.shorter,
                        }),
                    }}
                  >
                    {it.icon && (
                      <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5 }}>
                        {it.icon}
                      </ListItemIcon>
                    )}

                    {/* Texto com fade + tooltip quando colapsado */}
                    {collapsed ? (
                      <Tooltip title={it.label} placement="right">
                        <Box sx={{ width: 0 }} />
                      </Tooltip>
                    ) : (
                      <ListItemText
                        primary={it.label}
                        primaryTypographyProps={{ noWrap: true }}
                        sx={(t) => ({
                          opacity: collapsed ? 0 : 1,
                          transition: t.transitions.create('opacity', { duration: t.transitions.duration.shorter }),
                        })}
                      />
                    )}
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 1 }} />
      </Box>
    );
  }
}
