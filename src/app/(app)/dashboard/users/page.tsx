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

type TrainerInfo = {
  id: string;
  name: string | null;
  email: string | null;
};

type U = { id: string; name?: string | null; email?: string | null; role?: string | null; status?: string | null; approved?: boolean | null; created_at?: string | null };

export default async function UsersAdminPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('users')
    .select('id,name,email,role,status,approved,created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  const rows = (data ?? []) as U[];

  const clientIds = rows
    .filter((row) => (row.role ?? '').toUpperCase().includes('CLIENT'))
    .map((row) => row.id)
    .filter(Boolean);

  const trainerAssignments = new Map<string, TrainerInfo>();
  if (clientIds.length > 0) {
    const { data: links } = await sb
      .from('trainer_clients')
      .select('client_id, trainer:users!trainer_clients_trainer_id_fkey(id,name,email)')
      .in('client_id', clientIds);

    for (const link of links ?? []) {
      const trainer = (link as any)?.trainer;
      if (trainer?.id) {
        trainerAssignments.set(String((link as any)?.client_id), {
          id: String(trainer.id),
          name: trainer.name ?? null,
          email: trainer.email ?? null,
        });
      }
    }
  }

  const nameCellSx = { whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: { xs: '100%', md: 220 } } as const;
  const infoCellSx = { whiteSpace: 'normal', wordBreak: 'break-word' } as const;
  const metaCellSx = { whiteSpace: { xs: 'normal', md: 'nowrap' } } as const;
  const trainerCellSx = { whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: { xs: '100%', md: 220 } } as const;

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Utilizadores</Typography>

      <Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider', width: '100%', overflowX: 'visible' }}>
        <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={nameCellSx}>Nome</TableCell>
              <TableCell sx={nameCellSx}>Email</TableCell>
              <TableCell sx={metaCellSx}>Role</TableCell>
              <TableCell sx={metaCellSx}>Estado</TableCell>
              <TableCell sx={metaCellSx}>Registo</TableCell>
              <TableCell sx={trainerCellSx}>Personal trainer</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell sx={nameCellSx}>{u.name || '—'}</TableCell>
                <TableCell sx={infoCellSx}>{u.email || '—'}</TableCell>
                <TableCell sx={metaCellSx}>{u.role || '—'}</TableCell>
                <TableCell sx={metaCellSx}>{u.status ?? (u.approved ? 'ACTIVE' : 'PENDING')}</TableCell>
                <TableCell sx={metaCellSx}>{u.created_at ? new Date(u.created_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell sx={trainerCellSx}>
                  {(() => {
                    const trainer = trainerAssignments.get(u.id);
                    if (!trainer) return '—';
                    return trainer.name || trainer.email || trainer.id;
                  })()}
                </TableCell>
                <TableCell align="right">
                  <AdminUserRowActions id={u.id} currRole={u.role || 'CLIENT'} currStatus={u.status || (u.approved ? 'ACTIVE' : 'PENDING')} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center">Sem utilizadores.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
