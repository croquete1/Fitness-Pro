'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

type NotifItem = {
  id: string;
  title?: string | null;
  body?: string | null;
  created_at?: string | null;
  read?: boolean | null;
  href?: string | null;
};

export default function HeaderBell() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<NotifItem[]>([]);
  const [unread, setUnread] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/notifications/dropdown?unread=1&limit=10', { cache: 'no-store' });
      const j = await r.json();
      const arr: NotifItem[] = Array.isArray(j?.items) ? j.items : [];
      setItems(arr);
      setUnread(arr.filter((n) => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    // carrega no abrir (lazy)
    void load();
  };

  const handleClose = () => setAnchorEl(null);

  const go = (n: NotifItem) => {
    handleClose();
    // marca como lida e navega
    void fetch('/api/notifications/mark', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: [n.id], read: true }),
    });
    router.push(n.href || '/dashboard/notifications');
  };

  const markAll = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      setUnread(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton onClick={handleOpen} aria-label="Notificações">
          <Badge color="error" badgeContent={unread} max={99}>
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 320 } } }}
      >
        <MenuItem disabled sx={{ fontWeight: 700 }}>Notificações</MenuItem>
        <Divider />

        {loading && (
          <MenuItem disabled>
            <ListItemIcon><CircularProgress size={18} /></ListItemIcon>
            <ListItemText primary="A carregar…" />
          </MenuItem>
        )}

        {!loading && items.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="Sem notificações por ler" />
          </MenuItem>
        )}

        {!loading && items.map((n) => (
          <MenuItem key={n.id} onClick={() => go(n)}>
            <ListItemIcon><OpenInNewOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary={n.title || 'Notificação'}
              secondary={n.body || (n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : '')}
            />
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={markAll} disabled={loading || unread === 0}>
          <ListItemIcon><DoneAllOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Marcar tudo como lido" />
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); router.push('/dashboard/notifications'); }}>
          <ListItemText primary="Abrir centro de notificações" />
        </MenuItem>
      </Menu>
    </>
  );
}
