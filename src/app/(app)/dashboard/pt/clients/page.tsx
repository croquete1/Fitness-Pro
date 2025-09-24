export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default async function PtClientsPage() {
  const session = await getSessionUserSafe();
  const me = session?.user; if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // union: clientes por planos + por sessões
  const ids = new Set<string>();
  try {
    const { data: p } = await sb.from('training_plans').select('client_id').eq('trainer_id', me.id);
    (p ?? []).forEach((r: any) => r?.client_id && ids.add(r.client_id));
  } catch {}
  try {
    const { data: s } = await sb.from('sessions').select('client_id').eq('trainer_id', me.id);
    (s ?? []).forEach((r: any) => r?.client_id && ids.add(r.client_id));
  } catch {}

  let rows: any[] = [];
  if (ids.size) {
    const { data } = await sb.from('users').select('id,name,email,role').in('id', Array.from(ids));
    rows = data ?? [];
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Meus clientes</Typography>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Perfil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name ?? r.email ?? r.id}</TableCell>
                <TableCell>{r.email ?? '—'}</TableCell>
                <TableCell>
                  <Link className="text-sm underline" href={`/dashboard/users/${r.id}`}>abrir</Link>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center">Sem clientes associados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
