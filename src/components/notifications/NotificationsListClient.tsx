'use client';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

type Noti = { id: string; title: string; body?: string; href?: string; read?: boolean; created_at?: string | null };

export default function NotificationsListClient({ initial }: { initial: Noti[] }) {
  const [items, setItems] = React.useState<Noti[]>(initial);

  async function refresh() {
    const r = await fetch('/api/notifications?limit=100', { cache: 'no-store' });
    const j = await r.json();
    setItems(j?.items ?? []);
  }

  async function toggle(n: Noti) {
    await fetch(`/api/notifications/${n.id}/read`, { method: 'POST', body: JSON.stringify({ read: !n.read }) });
    refresh();
  }

  async function markAll() {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    refresh();
  }

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>Centro de notificações</Typography>
        <Button onClick={markAll}>Marcar tudo como lido</Button>
      </Stack>

      <List>
        {items.map((n) => (
          <ListItem key={n.id} divider secondaryAction={
            <Button size="small" onClick={() => toggle(n)}>{n.read ? 'Marcar como não lida' : 'Marcar como lida'}</Button>
          }>
            <ListItemText
              primary={`${n.title}${n.read ? '' : ' •'}`}
              secondary={n.body}
              primaryTypographyProps={{ fontWeight: n.read ? 400 : 700 }}
            />
          </ListItem>
        ))}
        {!items.length && <Typography variant="body2" color="text.secondary">Sem notificações.</Typography>}
      </List>
    </Paper>
  );
}
