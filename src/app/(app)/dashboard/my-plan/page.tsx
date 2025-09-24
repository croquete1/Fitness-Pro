// src/app/(app)/dashboard/my-plan/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type Plan = {
  id: string;
  title: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

export default async function MyPlanPage() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: plans } = await sb
    .from('training_plans')
    .select('id,title,status,start_date,end_date,created_at')
    .eq('client_id', me.id)
    .order('created_at', { ascending: false })
    .limit(8);

  const rows = (plans ?? []) as Plan[];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Os meus planos
      </Typography>

      {rows.length === 0 && (
        <Card variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography>Sem planos atribuídos de momento.</Typography>
        </Card>
      )}

      <Grid container spacing={2}>
        {rows.map((p) => {
          const start = p.start_date ? new Date(p.start_date) : null;
          const end = p.end_date ? new Date(p.end_date) : null;
          return (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  title={p.title ?? 'Plano de treino'}
                  subheader={start ? `início: ${start.toLocaleDateString('pt-PT')}` : '—'}
                  action={
                    <Chip
                      size="small"
                      label={String(p.status ?? 'ATIVO')}
                      color={(p.status ?? '').toUpperCase() === 'ATIVO' ? 'success' : 'default'}
                    />
                  }
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    {end ? `fim: ${end.toLocaleDateString('pt-PT')}` : 'sem data de fim'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {/* Espaço para resumo/contagens de dias/sessões se tiveres tabelas auxiliares */}
                    Consulta cada plano para veres os dias e exercícios atribuídos. 💪
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button LinkComponent={Link} href={`/dashboard/my-plan/${p.id}`} variant="contained" size="small">
                    Abrir
                  </Button>
                  <Button LinkComponent={Link} href={`/dashboard/sessions`} size="small">
                    Sessões
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
