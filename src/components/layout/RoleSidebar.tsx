'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { Box, Divider, IconButton, List, ListItemButton, ListItemText, Tooltip, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

type Item = { href: string; label: string; emoji?: string };
function itemsFor(role: string): Item[] {
  const R = role.toUpperCase();
  if (R === 'ADMIN') return [
    { href: '/dashboard/admin', label: 'Painel', emoji: '📊' },
    { href: '/dashboard/admin/users', label: 'Utilizadores', emoji: '👥' },
    { href: '/dashboard/admin/approvals', label: 'Aprovações', emoji: '✅' },
    { href: '/dashboard/admin/exercises', label: 'Exercícios', emoji: '🏋️' },
    { href: '/dashboard/system', label: 'Sistema', emoji: '⚙️' },
  ];
  if (R === 'PT' || R === 'TRAINER') return [
    { href: '/dashboard/pt', label: 'Painel', emoji: '📊' },
    { href: '/dashboard/pt/clients', label: 'Clientes', emoji: '🧑‍🤝‍🧑' },
    { href: '/dashboard/pt/sessions', label: 'Sessões', emoji: '📅' },
    { href: '/dashboard/pt/plans', label: 'Planos', emoji: '📋' },
    { href: '/dashboard/notifications', label: 'Notificações', emoji: '🔔' },
  ];
  return [
    { href: '/dashboard/clients', label: 'Painel', emoji: '🏠' },
    { href: '/dashboard/clients/metrics', label: 'Métricas', emoji: '📈' },
    { href: '/dashboard/sessions', label: 'Sessões', emoji: '📅' },
    { href: '/dashboard/my-plan', label: 'O meu plano', emoji: '📋' },
    { href: '/dashboard/notifications', label: 'Notificações', emoji: '🔔' },
  ];
}

export default function RoleSidebar({ role, userLabel }: { role: string; userLabel?: string }) {
  const { isMobile, open, closeMobile, collapsed, toggleCollapse } = useSidebar();
  const path = usePathname();
  const items = itemsFor(role);

  const width = collapsed ? 72 : 240;
  return (
    <>
      {/* backdrop mobile */}
      {isMobile && open && (
        <div onClick={closeMobile} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex: 98 }} />
      )}
      <aside
        style={{
          position: isMobile ? 'fixed' as const : 'sticky',
          top: 0, bottom: 0, left: isMobile ? (open ? 0 : -width) : 0,
          width, zIndex: 99, transition: 'left .2s ease, width .2s ease',
          background: 'var(--mui-palette-background-paper)',
          borderRight: '1px solid var(--mui-palette-divider)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:1.5, py:1 }}>
          <Typography fontWeight={800} sx={{ opacity: .9 }}>
            {collapsed ? 'FP' : 'Fitness&nbsp;Pro'}
          </Typography>
          {isMobile ? (
            <IconButton size="small" onClick={closeMobile}><CloseRoundedIcon /></IconButton>
          ) : (
            <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'}>
              <IconButton size="small" onClick={toggleCollapse}>
                {collapsed ? <ChevronRightRoundedIcon/> : <ChevronLeftRoundedIcon/>}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {!collapsed && userLabel && (
          <Typography variant="body2" sx={{ px:2, pb:1, opacity:.7 }}>👋 {userLabel}</Typography>
        )}
        <Divider />
        <List sx={{ py:0, flex:1, overflowY:'auto' }}>
          {items.map(it => {
            const active = path?.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} style={{ textDecoration:'none', color:'inherit' }}>
                <ListItemButton selected={!!active} sx={{ gap:1.25 }}>
                  <span aria-hidden style={{ width:22, textAlign:'center' }}>{it.emoji ?? '•'}</span>
                  {!collapsed && <ListItemText primary={it.label} />}
                </ListItemButton>
              </Link>
            );
          })}
        </List>
        <Divider />
        <Box sx={{ p:1.5, fontSize:12, opacity:.6 }}>v1.0</Box>
      </aside>
    </>
  );
}
