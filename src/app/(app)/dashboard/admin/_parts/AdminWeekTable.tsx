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

export default async function AdminWeekTable() {
  const sb = createServerClient();

  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const { data: rawWeek } = await sb
    .from('sessions')
    .select('id,trainer_id,scheduled_at')
    .gte('scheduled_at', startToday.toISOString())
    .lt('scheduled_at', in7.toISOString());

  const byPT = new Map<string, number>();
  (rawWeek ?? []).forEach((s: any) => {
    if (!s.trainer_id) return;
    byPT.set(s.trainer_id, (byPT.get(s.trainer_id) || 0) + 1);
  });

  const trainerIds = Array.from(byPT.keys());
  let trainerNames = new Map<string, string>();
  if (trainerIds.length) {
    const { data: tUsers } = await sb.from('users').select('id,name,email').in('id', trainerIds);
    if (tUsers?.length) {
      trainerNames = new Map((tUsers ?? []).map((u: any) => [u.id, u.name ?? u.email ?? u.id]));
    } else {
      const { data: tProf } = await sb.from('profiles').select('id,name,email').in('id', trainerIds);
      trainerNames = new Map((tProf ?? []).map((u: any) => [u.id, u.name ?? u.email ?? u.id]));
    }
  }

  const weekRows = Array.from(byPT.entries())
    .map(([id, c]) => ({ id, name: trainerNames.get(id) ?? id, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography
        variant="subtitle2"
        fontWeight={800}
        sx={{ mb: 1 }}
        title="Próximos 7 dias — origem: tabela sessions"
      >
        Sessões por PT (próx. 7 dias)
      </Typography>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>PT</TableCell>
              <TableCell align="right">Sessões</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weekRows.length === 0 && (
              <TableRow><TableCell colSpan={2} align="center">Sem dados.</TableCell></TableRow>
            )}
            {weekRows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">{r.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
