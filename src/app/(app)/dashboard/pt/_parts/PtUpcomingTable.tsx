// Server Component
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export default async function PtUpcomingTable() {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) return null;

  const sb = createServerClient();
  const now = new Date();

  const { data: upcoming } = await sb
    .from('sessions')
    .select('id, scheduled_at, location, status, client_id')
    .eq('trainer_id', user.id)
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(6);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography
        variant="subtitle2"
        fontWeight={800}
        sx={{ mb: 1 }}
        title="Próximos eventos deste PT — origem: sessions"
      >
        Próximas sessões
      </Typography>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Local</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Cliente</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!upcoming || !upcoming.length) && (
              <TableRow><TableCell colSpan={4} align="center">Sem sessões marcadas.</TableCell></TableRow>
            )}
            {(upcoming ?? []).map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell>{s.location ?? '—'}</TableCell>
                <TableCell>{s.status ?? '—'}</TableCell>
                <TableCell>{s.client_id ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
