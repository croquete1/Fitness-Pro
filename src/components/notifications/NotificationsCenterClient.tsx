'use client';

import * as React from 'react';
import {
  Paper, Stack, Typography, Switch, Button, Divider, List, ListItem, ListItemButton,
  ListItemText, ListItemIcon, TextField, Pagination, Box, Chip
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useRouter } from 'next/navigation';

type Notif = {
  id: string;
  title: string;
  body?: string | null;
  href?: string | null;
  read: boolean;
  created_at: string;
};

export default function NotificationsCenterClient({ initialItems }: { initialItems: Notif[] }) {
  const router = useRouter();
  const [onlyUnread, setOnlyUnread] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [items, setItems] = React.useState<Notif[]>(initialItems ?? []);
  const [total, setTotal] = React.useState<number>(initialItems?.length ?? 0);
  const [loading, setLoading] = React.useState(false);

  async function load(p = page, query = q, unread = onlyUnread) {
    setLoading(true);
    try {
      const r = await fetch(`/api/notifications/list?unread=${unread ? '1' : '0'}&page=${p}&pageSize=${pageSize}&q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      const data = await r.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? (data.items?.length ?? 0));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(1, q, onlyUnread); setPage(1); /* reset page ao mudar filtros */ }, [onlyUnread]);
  React.useEffect(() => { const t = setTimeout(() => load(1, q, onlyUnread), 250); return () => clearTimeout(t); }, [q]);
  React.useEffect(() => { load(page, q, onlyUnread); }, [page]);

  async function mark(id: string, read: boolean) {
    await fetch(read ? '/api/notifications/mark-read' : '/api/notifications/mark-unread', {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    });
    load(page, q, onlyUnread);
  }

  async function markAll() {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    load(page, q, onlyUnread);
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
        <Typography variant="h6" fontWeight={900} sx={{ flex: 1 }}>
          Centro de notificações
        </Typography>
        <TextField
          size="small"
          placeholder="Procurar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ width: { xs: '100%', sm: 260 } }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Switch checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
          <Typography variant="body2">Só não lidas</Typography>
        </Stack>
        <Button size="small" startIcon={<DoneAllIcon />} onClick={markAll}>
          Marcar tudo como lido
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <List disablePadding>
        {items.map((n) => (
          <ListItem key={n.id} disablePadding divider secondaryAction={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={n.read ? <MarkEmailUnreadOutlinedIcon /> : <MarkEmailReadOutlinedIcon />}
                onClick={() => mark(n.id, !n.read)}
              >
                {n.read ? 'Marcar por ler' : 'Marcar lida'}
              </Button>
              {n.href && (
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                  onClick={() => router.push(n.href!)}
                >
                  Abrir
                </Button>
              )}
            </Stack>
          }>
            <ListItemButton onClick={() => n.href ? router.push(n.href) : undefined}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {!n.read ? <CircleIcon sx={{ fontSize: 8 }} color="primary" /> : <span />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontWeight: n.read ? 600 : 800 }}>{n.title}</span>
                    <Chip size="small" variant="outlined" label={new Date(n.created_at).toLocaleString('pt-PT')} />
                  </Box>
                }
                secondary={n.body}
                primaryTypographyProps={{ noWrap: false }}
                secondaryTypographyProps={{ noWrap: false }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {!loading && items.length === 0 && (
          <ListItem><ListItemText primary="Sem resultados." /></ListItem>
        )}
      </List>

      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} />
      </Stack>
    </Paper>
  );
}
