// src/components/HeaderUserMenu.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

export default function HeaderUserMenu() {
  const { data } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const avatarUrl = (data as any)?.profile?.avatar_url || (data?.user as any)?.avatar_url || null;
  const name = data?.user?.name || data?.user?.email || 'Utilizador';

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" aria-label="Menu do utilizador">
        <Avatar src={avatarUrl || undefined} alt={name} sx={{ width: 32, height: 32 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); router.push('/dashboard/perfil'); }}>
          <ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Meu perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); router.push('/dashboard/definicoes'); }}>
          <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Definições</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); signOut({ callbackUrl: '/login' }); }}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Terminar sessão</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
