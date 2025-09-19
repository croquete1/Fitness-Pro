export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

export default async function PTSessionsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('sessions')
    .select('id,scheduled_at,location,status,client_id')
    .eq('trainer_id', session.user.id)
    .order('scheduled_at', { ascending: false })
    .limit(200);

  return (
    <Paper elevation={0} sx={{ p:2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Sessões (PT)</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell><TableCell>Local</TableCell><TableCell>Estado</TableCell><TableCell>Cliente</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).map((s:any)=>(
            <TableRow key={s.id}>
              <TableCell>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}</TableCell>
              <TableCell>{s.location ?? '—'}</TableCell>
              <TableCell>{s.status ?? '—'}</TableCell>
              <TableCell>{s.client_id ?? '—'}</TableCell>
            </TableRow>
          ))}
          {(!data || data.length===0) && <TableRow><TableCell colSpan={4} align="center">Sem sessões.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  );
}
