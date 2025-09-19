'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

type Noti = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  read?: boolean;
  created_at?: string | null;
};

export default function HeaderBell() {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const [items, setItems] = React.useState<Noti[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/notifications?unread=1&limit=10', { cache: 'no-store' });
      const j = await r.json();
      setItems(j?.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  function open(e: React.MouseEvent<HTMLElement>) {
    setAnchor(e.currentTarget);
    load();
  }
  function close() {
    setAnchor(null);
  }

  async function markAll() {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    await load();
  }

  async function clickItem(n: Noti) {
    await fetch(`/api/notifications/${n.id}/read`, { method: 'POST' });
    close();
    router.push(n.href || '/dashboard/notifications');
  }

  const cnt = items.length;

  return (
    <>
      <IconButton color="inherit" onClick={open} aria-label="Notificações">
        <Badge badgeContent={cnt || 0} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, p: 1 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 0.5 }}>
          <Typography variant="subtitle2">Notificações</Typography>
          <Button size="small" onClick={markAll} disabled={loading || !cnt}>
            Marcar tudo como lido
          </Button>
        </Stack>

        <List dense disablePadding>
          {items.map((n) => (
            <ListItem key={n.id} divider disablePadding>
              <ListItemButton onClick={() => clickItem(n)}>
                <ListItemText
                  primary={n.title}
                  secondary={n.body}
                  primaryTypographyProps={{ noWrap: true }}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {!cnt && (
            <ListItem>
              <ListItemText primary="Sem notificações por ler." />
            </ListItem>
          )}
        </List>

        <Stack direction="row" justifyContent="flex-end" sx={{ px: 1, pb: 0.5 }}>
          <Button size="small" onClick={() => { close(); router.push('/dashboard/notifications'); }}>
            Ver tudo
          </Button>
        </Stack>
      </Popover>
    </>
  );
}
