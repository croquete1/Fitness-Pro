'use client';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';

type Noti = { id: string; title: string; body?: string; href?: string; read?: boolean; created_at?: string | null };

export default function NotificationsListClient() {
  const [tab, setTab] = React.useState<'all' | 'unread' | 'read'>('unread');
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [items, setItems] = React.useState<Noti[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const pages = Math.max(1, Math.ceil(count / pageSize));

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/notifications?status=${tab}&page=${page}&pageSize=${pageSize}`, { cache: 'no-store' });
      const j = await r.json();
      setItems(j?.items ?? []);
      setCount(j?.count ?? 0);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab, page]);

  async function toggle(n: Noti) {
    await fetch(`/api/notifications/${n.id}/read`, { method: 'POST', body: JSON.stringify({ read: !n.read }) });
    load();
  }

  async function markAll() {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    if (tab !== 'read') setTab('unread'); // força refresh útil
    load();
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>Centro de notificações</Typography>
        <Button onClick={markAll} disabled={loading || !items.length}>Marcar tudo como lido</Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => { setPage(1); setTab(v); }} sx={{ mb: 1 }}>
        <Tab value="all" label="Todas" />
        <Tab value="unread" label="Por ler" />
        <Tab value="read" label="Lidas" />
      </Tabs>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : (
        <>
          <List>
            {items.map((n) => (
              <ListItem key={n.id} divider disablePadding
                secondaryAction={<Button size="small" onClick={() => toggle(n)}>{n.read ? 'Marcar como não lida' : 'Marcar como lida'}</Button>}>
                <ListItemButton component="a" href={n.href || '/dashboard/notifications'}>
                  <ListItemText
                    primary={`${n.title}${n.read ? '' : ' •'}`}
                    secondary={n.body}
                    primaryTypographyProps={{ fontWeight: n.read ? 400 : 700, noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {!items.length && <Typography variant="body2" sx={{ opacity: .7, px: 2, py: 3 }}>Sem notificações.</Typography>}
          </List>

          {pages > 1 && (
            <Stack alignItems="center" sx={{ mt: 1 }}>
              <Pagination page={page} count={pages} onChange={(_, p) => setPage(p)} />
            </Stack>
          )}
        </>
      )}
    </Paper>
  );
}
