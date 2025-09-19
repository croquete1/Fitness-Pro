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

export default async function PTPlansPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,client_id')
    .eq('trainer_id', session.user.id)
    .order('updated_at', { ascending: false });

  return (
    <Paper elevation={0} sx={{ p:2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Planos (PT)</Typography>
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>Título</TableCell><TableCell>Estado</TableCell><TableCell>Cliente</TableCell><TableCell>Atualizado</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {(data ?? []).map((p:any)=>(
            <TableRow key={p.id}>
              <TableCell>{p.title ?? '—'}</TableCell>
              <TableCell>{p.status ?? '—'}</TableCell>
              <TableCell>{p.client_id ?? '—'}</TableCell>
              <TableCell>{p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}</TableCell>
            </TableRow>
          ))}
          {(!data || data.length===0) && <TableRow><TableCell colSpan={4} align="center">Sem planos.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  );
}
