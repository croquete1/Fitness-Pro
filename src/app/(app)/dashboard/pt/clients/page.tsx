export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { brand } from '@/lib/brand';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export const metadata: Metadata = {
  title: `Clientes do Personal Trainer · ${brand.name}`,
  description: 'Consulta os clientes associados aos teus planos e sessões.',
};

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
    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>Clientes associados</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Consulta quem já tens sob acompanhamento e convida novos clientes quando precisares.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/register"
          variant="contained"
          size="small"
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, borderRadius: 999 }}
        >
          Adicionar novo cliente
        </Button>
      </Stack>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Perfil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name ?? r.email ?? r.id}</TableCell>
                <TableCell>{r.email ?? '—'}</TableCell>
                <TableCell align="right">
                  <Link className="text-sm underline" href={`/dashboard/users/${r.id}`}>
                    ver perfil
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Ainda não tens clientes atribuídos. Usa o botão acima para convidar o primeiro.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
