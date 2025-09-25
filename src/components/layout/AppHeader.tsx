'use client';
import * as React from 'react';
import { AppBar, Toolbar, IconButton, Box, Menu, MenuItem, Typography, Avatar, Tooltip } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useSidebar } from './SidebarContext';
import { useTheme as useNextTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
// se tiveres, mantém:
import HeaderBell from '@/components/layout/HeaderBell';

export default function AppHeader() {
  const { openMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useNextTheme();
  const isDark = resolvedTheme === 'dark';

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  return (
    <AppBar position="sticky" elevation={0} sx={{ backdropFilter:'blur(6px)', backgroundColor:'transparent', borderBottom:'1px solid var(--mui-palette-divider)' }}>
      <Toolbar sx={{ minHeight:64, px:1.5 }}>
        <IconButton edge="start" sx={{ display:{ lg:'none' } }} onClick={openMobile}><MenuRoundedIcon/></IconButton>
        <Box sx={{ flex:1 }} /> {/* espaço para eventual GlobalSearch */}
        <HeaderBell />
        <Tooltip title={isDark ? 'Modo claro' : 'Modo escuro'}>
          <IconButton onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="alternar tema">
            {isDark ? <LightModeOutlinedIcon/> : <DarkModeOutlinedIcon/>}
          </IconButton>
        </Tooltip>
        <IconButton onClick={(e)=>setAnchor(e.currentTarget)} sx={{ ml:1 }}>
          <Avatar sx={{ width:32, height:32 }}>FP</Avatar>
        </IconButton>
        <Menu anchorEl={anchor} open={open} onClose={()=>setAnchor(null)}>
          <MenuItem disabled><Typography variant="body2">Ligado</Typography></MenuItem>
          <Link href="/dashboard/profile" style={{ color:'inherit', textDecoration:'none' }}>
            <MenuItem onClick={()=>setAnchor(null)}><PersonOutlineOutlinedIcon fontSize="small" style={{marginRight:8}}/> Meu perfil</MenuItem>
          </Link>
          <MenuItem onClick={()=>signOut({ callbackUrl:'/login' })}><LogoutOutlinedIcon fontSize="small" style={{marginRight:8}}/> Terminar sessão</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
