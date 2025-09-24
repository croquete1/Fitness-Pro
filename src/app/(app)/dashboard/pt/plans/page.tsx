export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';

export default async function PtPlansPage() {
  const session = await getSessionUserSafe();
  const me = session?.user; if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data: plans } = await sb.from('training_plans')
    .select('id,title,status,start_date,end_date,client_id')
    .eq('trainer_id', me.id)
    .order('created_at', { ascending: false });

  // obter nomes dos clientes
  const clientIds = Array.from(new Set((plans ?? []).map((p: any) => p.client_id).filter(Boolean)));
  let nameMap = new Map<string,string>();
  if (clientIds.length) {
    const { data } = await sb.from('users').select('id,name,email').in('id', clientIds);
    nameMap = new Map((data ?? []).map((u:any) => [u.id, u.name ?? u.email ?? u.id]));
  }

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 1.5 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Typography variant="h5" fontWeight={800}>Planos</Typography>
        <Button component={Link} href="/dashboard/pt/plans/new" variant="contained">Criar plano</Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(plans ?? []).map((p:any) => (
              <TableRow key={p.id}>
                <TableCell>{p.title}</TableCell>
                <TableCell>{nameMap.get(p.client_id) ?? p.client_id}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.start_date ? new Date(p.start_date).toLocaleDateString('pt-PT') : '—'}</TableCell>
                <TableCell>{p.end_date ? new Date(p.end_date).toLocaleDateString('pt-PT') : '—'}</TableCell>
                <TableCell>
                  <Link className="underline text-sm" href={`/dashboard/pt/plans/${p.id}`}>abrir</Link>
                </TableCell>
              </TableRow>
            ))}
            {(!plans || plans.length===0) && (
              <TableRow><TableCell colSpan={6} align="center">Sem planos.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
