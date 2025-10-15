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
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

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

  const planIds = rows.map((plan) => plan.id);
  let rawDayRows: Array<{ plan_id: string; day_index: number; exercise_id?: string | null; id?: string | null }> = [];
  if (planIds.length > 0) {
    const { data: dayRows } = await sb
      .from('plan_day_exercises' as any)
      .select('id,plan_id,day_index,exercise_id')
      .in('plan_id', planIds);
    rawDayRows = (dayRows ?? []) as any;

    if (rawDayRows.length === 0) {
      const { data: fallbackRows } = await sb
        .from('plan_day_items' as any)
        .select('id,plan_id,day_index,exercise_id')
        .in('plan_id', planIds);
      rawDayRows = (fallbackRows ?? []) as any;
    }
  }

  const perPlanDay = new Map<string, Map<number, number>>();
  const seen = new Set<string>();
  for (const row of rawDayRows) {
    const planId = row?.plan_id as string | undefined;
    const dayIndex = typeof row?.day_index === 'number' ? row.day_index : Number(row?.day_index ?? NaN);
    if (!planId || Number.isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) continue;
    const uniqKey = `${planId}-${dayIndex}-${row?.exercise_id ?? row?.id ?? ''}`;
    if (seen.has(uniqKey)) continue;
    seen.add(uniqKey);
    const map = perPlanDay.get(planId) ?? new Map<number, number>();
    map.set(dayIndex, (map.get(dayIndex) ?? 0) + 1);
    perPlanDay.set(planId, map);
  }

  const weeklyAgenda = Array.from({ length: 7 }, (_, dayIndex) => {
    const entries = rows
      .map((plan) => {
        const count = perPlanDay.get(plan.id)?.get(dayIndex) ?? 0;
        if (!count) return null;
        return { planId: plan.id, title: plan.title ?? 'Plano de treino', status: plan.status, count };
      })
      .filter((entry): entry is { planId: string; title: string; status: string | null; count: number } => Boolean(entry));
    return { dayIndex, entries };
  });

  const hasAgendaEntries = weeklyAgenda.some((day) => day.entries.length > 0);
  const todayIndex = (new Date().getDay() + 6) % 7;

  function dayLabel(dayIndex: number) {
    return ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][dayIndex] ?? `Dia ${dayIndex + 1}`;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Os meus planos
      </Typography>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardHeader
          title="Agenda semanal"
          subheader={
            hasAgendaEntries
              ? 'Consulta rapidamente quais os planos atribuídos em cada dia da semana.'
              : 'Ainda não existem treinos atribuídos aos dias desta semana — verifica novamente mais tarde.'
          }
        />
        <CardContent>
          <Stack spacing={1.5}>
            {weeklyAgenda.map(({ dayIndex, entries }) => (
              <Box key={dayIndex} sx={{ display: 'grid', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {dayLabel(dayIndex)}
                  </Typography>
                  {dayIndex === todayIndex && <Chip label="Hoje" size="small" color="primary" />}
                  <Divider flexItem sx={{ flex: 1, opacity: 0.5 }} />
                </Box>
                {entries.length > 0 ? (
                  <Stack spacing={0.75}>
                    {entries.map((entry) => (
                      <Box
                        key={`${entry.planId}-${dayIndex}`}
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 1,
                          justifyContent: 'space-between',
                          backgroundColor: 'action.hover',
                          borderRadius: 2,
                          px: 1.25,
                          py: 1,
                        }}
                      >
                        <Box sx={{ display: 'grid' }}>
                          <Typography sx={{ fontWeight: 600 }}>{entry.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {entry.count} exercício{entry.count === 1 ? '' : 's'} planeado{entry.count === 1 ? '' : 's'}
                          </Typography>
                        </Box>
                        <Button
                          LinkComponent={Link}
                          href={`/dashboard/my-plan/${entry.planId}`}
                          size="small"
                          variant="outlined"
                        >
                          Abrir plano
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Descanso ou sem treino atribuído.
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

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
