'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, Paper, IconButton, Tooltip, List, ListItemButton, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

import { useSidebar } from '@/components/layout/SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  exact?: boolean;
  activePrefix?: string;
  match?: (path: string) => (href: string) => boolean;
};

type Props =
  | { header?: React.ReactNode; items: NavItem[]; children?: never }
  | { header?: React.ReactNode; items?: never; children: React.ReactNode };

export default function SidebarBase(props: Props) {
  const path = usePathname();
  const { collapsed, toggleCollapse, isMobile, closeMobile } = useSidebar();

  const width = collapsed ? 72 : 240;

  return (
    <Paper
      component="aside"
      elevation={0}
      sx={{
        position: 'relative',
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        width,
        transition: 'width .26s cubic-bezier(.18,.9,.22,1)',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header da sidebar + Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, minHeight: 56 }}>
        <Box sx={{ minWidth: 0, maxWidth: '70%' }}>{props.header}</Box>
        <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'}>
          <IconButton size="small" onClick={toggleCollapse} aria-label="Alternar sidebar" sx={{ ml: 0.5 }}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />

      {/* Conteúdo */}
      <Box sx={{ p: 0.5 }}>
        {'items' in props && props.items ? (
          <List dense disablePadding sx={{ display: 'grid', gap: 0.5 }}>
            {props.items.map((it) => {
              const active = it.exact ? path === it.href : (it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href));
              const button = (
                <ListItemButton
                  component={Link}
                  href={it.href}
                  prefetch={false}
                  onClick={() => { if (isMobile) closeMobile(); }}
                  selected={active}
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? it.label : undefined}
                  sx={{
                    borderRadius: 1.5,
                    height: 40,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': { bgcolor: 'action.selected' },
                    },
                    '&.Mui-selected .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 700,
                    },
                  }}
                >
                  {it.icon && (
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 36,
                        mr: collapsed ? 0 : 1,
                        justifyContent: 'center',
                        color: active ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {it.icon}
                    </ListItemIcon>
                  )}
                  {!collapsed && <ListItemText primary={it.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }} />}
                </ListItemButton>
              );
              return <React.Fragment key={it.href}>{button}</React.Fragment>;
            })}
          </List>
        ) : (
          <Box>{('children' in props) && props.children}</Box>
        )}
      </Box>
    </Paper>
  );
}
