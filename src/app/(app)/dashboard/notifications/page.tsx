// src/app/(app)/dashboard/notifications/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

function MarkAllButton() {
  'use client';
  async function markAll() {
    await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ markAllRead: true }) });
    location.reload();
  }
  return <Button size="small" onClick={markAll}>Marcar tudo como lido</Button>;
}

export default async function NotificationsCenter() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb
    .from('notifications')
    .select('id,title,body,read,created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const items = data ?? [];

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" fontWeight={800}>Centro de notificações</Typography>
        <MarkAllButton />
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      <List>
        {items.map((n) => (
          <ListItem key={n.id} sx={{ opacity: n.read ? 0.6 : 1 }}>
            <ListItemText
              primary={n.title || 'Notificação'}
              secondary={n.body || new Date(n.created_at as any).toLocaleString('pt-PT')}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </ListItem>
        ))}
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary">Sem notificações.</Typography>
        )}
      </List>
    </Paper>
  );
}
