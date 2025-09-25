import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { Box, Button, Chip, Container, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';

export const revalidate = 0;

export default async function AdminExercisesPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim();

  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  let query = sb.from('exercises').select('id, name, muscle_group, equipment, difficulty, is_active, created_at').order('created_at', { ascending: false });
  if (q) query = query.ilike('name', `%${q}%`);

  const { data, error } = await query;
  const rows = (!error && Array.isArray(data) ? data : []) as any[];

  return (
    <Container maxWidth="lg" sx={{ display:'grid', gap:2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>🏋️ Exercícios</Typography>
        <Stack direction="row" gap={1}>
          <Link href="/dashboard/admin/exercises/new"><Button variant="contained">➕ Novo</Button></Link>
        </Stack>
      </Stack>

      <Box component="form" action="/dashboard/admin/exercises" method="get" sx={{ display:'flex', gap:1 }}>
        <TextField name="q" defaultValue={q} label="🔎 Pesquisar exercícios" placeholder="ex.: Agachamento" sx={{ minWidth: 320 }} />
        <Button type="submit">Procurar</Button>
      </Box>

      <Box sx={{ borderRadius:3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', overflow:'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor:'action.hover' }}>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Grupo muscular</TableCell>
              <TableCell>Equipamento</TableCell>
              <TableCell>Dificuldade</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py:4, opacity:.7 }}>Sem exercícios.</TableCell></TableRow>
            ) : rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell><strong>{r.name}</strong></TableCell>
                <TableCell>{r.muscle_group ?? '—'}</TableCell>
                <TableCell>{r.equipment ?? '—'}</TableCell>
                <TableCell>{r.difficulty ?? '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.is_active ? 'Ativo' : 'Inativo'} color={r.is_active ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Link href={`/dashboard/admin/exercises/${r.id}`}><Button size="small">✏️ Editar</Button></Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
