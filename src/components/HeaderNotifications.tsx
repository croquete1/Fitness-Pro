'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

type Noti = {
  id: string;
  title: string;
  body?: string | null;
  created_at?: string;
  unread?: boolean; // mapped from read=false
};

export default function HeaderNotifications() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [items, setItems] = React.useState<Noti[]>([]);
  const [loading, setLoading] = React.useState(false);

  // carregar apenas não lidas por defeito
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?unread=1', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(
          (data?.items || []).map((n: any) => ({
            id: n.id,
            title: n.title || 'Notificação',
            body: n.body || null,
            created_at: n.created_at,
            unread: !n.read,
          }))
        );
      }
    } catch {}
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {}
  }

  async function markAll() {
    try {
      await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ markAllRead: true }) });
      setItems([]);
    } catch {}
  }

  return (
    <>
      <IconButton aria-label="Notificações" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge color="error" badgeContent={items.length}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360 } } }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>Notificações</Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'A carregar…' : items.length === 0 ? 'Sem novas notificações' : 'Por ler'}
          </Typography>
        </Box>
        <Divider />
        {items.map((n) => (
          <MenuItem key={n.id} onClick={() => markRead(n.id)} selected={!!n.unread}>
            <ListItemText
              primary={n.title}
              secondary={n.body ?? undefined}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ noWrap: true }}
            />
            <ListItemSecondaryAction>
              <Button size="small" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                Lida
              </Button>
            </ListItemSecondaryAction>
          </MenuItem>
        ))}
        {items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" onClick={markAll}>
                Marcar tudo como lido
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
