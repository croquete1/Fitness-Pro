export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

type UserRow = { id: string; name?: string | null; email?: string | null; role?: string | null; created_at?: string | null };

export default async function ApprovalsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // tentar dois esquemas (approved=false) OU (status='PENDING')
  let pending: UserRow[] = [];
  try {
    const { data } = await sb.from('users').select('id,name,email,role,created_at').eq('approved', false);
    if (data?.length) pending = data as any;
  } catch {}
  if (pending.length === 0) {
    try {
      const { data } = await sb.from('users').select('id,name,email,role,created_at,status').eq('status', 'PENDING');
      pending = (data ?? []) as any;
    } catch {}
  }

  async function RowActions({ id }: { id: string }) {
    'use client';
    async function doAction(path: string) {
      const r = await fetch(path, { method: 'POST' });
      if (r.ok) location.reload();
    }
    return (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" onClick={() => doAction(`/api/admin/approvals/${id}/approve`)}>
          Aprovar
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={() => doAction(`/api/admin/approvals/${id}/reject`)}>
          Rejeitar
        </Button>
      </Stack>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Aprovações</Typography>

      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: (t) => `1px solid ${t.palette.divider}` }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Registo</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pending.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name || '—'}</TableCell>
                <TableCell>{u.email || '—'}</TableCell>
                <TableCell>{u.role || '—'}</TableCell>
                <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell align="right"><RowActions id={u.id} /></TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">Sem registos pendentes.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
