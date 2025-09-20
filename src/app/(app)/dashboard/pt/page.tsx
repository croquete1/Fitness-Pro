// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';
import { Box, Paper, Stack, Typography, Button } from '@mui/material';

export default async function PTDashboard() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');
  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb.from('profiles').select('name, avatar_url').eq('id', sessionUser.user.id).maybeSingle();

  // KPIs simples (clientes, planos, sessões 7d, notifs)
  const now = new Date(); const in7 = new Date(now); in7.setDate(now.getDate()+7);
  async function cnt(table:string, build?:(q:any)=>any){ try{ let q = sb.from(table).select('*', { count:'exact', head:true }); if(build) q = build(q); const { count } = await q; return count??0; }catch{ return 0; } }
  const [myClients, myPlans, myUpcoming, unread] = await Promise.all([
    cnt('trainer_clients', q=>q.eq('trainer_id', sessionUser.user.id)),
    cnt('training_plans', q=>q.eq('trainer_id', sessionUser.user.id)),
    cnt('sessions', q=>q.eq('trainer_id', sessionUser.user.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    cnt('notifications', q=>q.eq('user_id', sessionUser.user.id).eq('read', false)),
  ]);

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={900}>Boa {new Date().getHours()<12?'manhã':new Date().getHours()<20?'tarde':'noite'}, {prof?.name ?? sessionUser.user.name ?? 'PT'} </Typography>
        <Typography variant="caption" sx={{ opacity:.7 }}>PT</Typography>
      </Paper>

      <Box sx={{ display:'grid', gap:2, gridTemplateColumns: { xs:'1fr', md:'repeat(4,1fr)' } }}>
        <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}><Typography>Clientes</Typography><Typography variant="h4">{myClients}</Typography></Paper>
        <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}><Typography>Planos</Typography><Typography variant="h4">{myPlans}</Typography></Paper>
        <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}><Typography>Sessões (7d)</Typography><Typography variant="h4">{myUpcoming}</Typography></Paper>
        <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}><Typography>Notificações</Typography><Typography variant="h4">{unread}</Typography></Paper>
      </Box>

      <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}>
        <Stack direction="row" spacing={1}>
          <Button href="/dashboard/pt/plans" variant="contained">Gerir planos</Button>
          <Button href="/dashboard/sessions" variant="outlined">Ver sessões</Button>
          <Button href="/dashboard/clients" variant="outlined">Meus clientes</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
