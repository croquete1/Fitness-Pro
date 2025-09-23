// Server Component
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export default async function ClientUpcomingTable() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) return null;

  const sb = createServerClient();
  const now = new Date();

  const { data: upcomingRows } = await sb
    .from('sessions')
    .select('id,scheduled_at,location,status,trainer_id')
    .eq('client_id', me.id)
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(6);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography
        variant="subtitle2"
        fontWeight={800}
        sx={{ mb: 1 }}
        title="As tuas próximas sessões — origem: sessions"
      >
        Próximas sessões
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Local</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>PT</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(upcomingRows ?? []).map((s: any) => (
            <TableRow key={s.id}>
              <TableCell>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}</TableCell>
              <TableCell>{s.location ?? '—'}</TableCell>
              <TableCell>{s.status ?? '—'}</TableCell>
              <TableCell>{s.trainer_id ?? '—'}</TableCell>
            </TableRow>
          ))}
          {(!upcomingRows || !upcomingRows.length) && (
            <TableRow><TableCell colSpan={4} align="center">Sem sessões marcadas.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-2 text-right">
        <Link href="/dashboard/sessions" className="text-sm">ver todas</Link>
      </div>
    </Paper>
  );
}
