export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

export default async function HistoryPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';

  const sb = createServerClient();

  let query = sb.from('sessions').select('id,scheduled_at,trainer_id,client_id,status,location').order('scheduled_at', { ascending: false }).limit(500);
  if (role === 'PT') query = query.eq('trainer_id', session.user.id);
  if (role === 'CLIENT') query = query.eq('client_id', session.user.id);

  const { data } = await query;

  const rows = data ?? [];

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Histórico</Typography>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>PT</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Local</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell>{s.trainer_id ?? '—'}</TableCell>
                <TableCell>{s.client_id ?? '—'}</TableCell>
                <TableCell>{s.location ?? '—'}</TableCell>
                <TableCell>{s.status ?? '—'}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">Sem registos.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
