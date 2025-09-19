export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export default async function PTMessagesPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('messages')
    .select('id,body,sent_at,from_id,to_id')
    .or(`from_id.eq.${session.user.id},to_id.eq.${session.user.id}`)
    .order('sent_at', { ascending: false })
    .limit(100);

  return (
    <Paper elevation={0} sx={{ p:2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Mensagens</Typography>
      <List>
        {(data ?? []).map((m:any)=>(
          <ListItem key={m.id} divider>
            <ListItemText
              primary={m.body ?? '—'}
              secondary={m.sent_at ? new Date(m.sent_at).toLocaleString('pt-PT') : '—'}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </ListItem>
        ))}
        {(!data || data.length===0) && <Typography variant="body2" color="text.secondary">Sem mensagens.</Typography>}
      </List>
    </Paper>
  );
}
