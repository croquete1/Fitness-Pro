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
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import AdminUserRowActions from '@/components/admin/AdminUserRowActions';

type U = { id: string; name?: string | null; email?: string | null; role?: string | null; status?: string | null; approved?: boolean | null; created_at?: string | null };

export default async function UsersAdminPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb.from('users').select('id,name,email,role,status,approved,created_at').order('created_at', { ascending: false }).limit(500);
  const rows = (data ?? []) as U[];

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Utilizadores</Typography>

      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Registo</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name || '—'}</TableCell>
                <TableCell>{u.email || '—'}</TableCell>
                <TableCell>{u.role || '—'}</TableCell>
                <TableCell>{u.status ?? (u.approved ? 'ACTIVE' : 'PENDING')}</TableCell>
                <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell align="right">
                  <AdminUserRowActions id={u.id} currRole={u.role || 'CLIENT'} currStatus={u.status || (u.approved ? 'ACTIVE' : 'PENDING')} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">Sem utilizadores.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
