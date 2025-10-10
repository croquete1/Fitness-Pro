// src/app/(app)/dashboard/plans/[id]/print/page.tsx
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { redirect, notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;

async function fetchPlan(sb: SB, id: string) {
  // 1) Plano
  const { data: plan } = await sb
    .from('training_plans')
    .select('id,title,status,start_date,end_date,client_id,trainer_id')
    .eq('id', id)
    .maybeSingle();
  if (!plan) return null;

  // 2) Dias
  const { data: days } = await sb
    .from('plan_days' as any)
    .select('id, plan_id, day_index')
    .eq('plan_id', id);

  // 3) Itens + Exercícios
  const dayIds = (days ?? []).map((d: any) => d.id);
  let items: any[] = [];
  if (dayIds.length) {
    const { data: rawItems } = await sb
      .from('plan_day_items' as any)
      .select('id,plan_day_id,exercise_id,sets,reps,rest_seconds,notes')
      .in('plan_day_id', dayIds);
    items = rawItems ?? [];
  }

  const exIds = Array.from(new Set(items.map((i: any) => i.exercise_id).filter(Boolean)));
  const exMap = new Map<string, any>();
  if (exIds.length) {
    const { data: exs } = await sb
      .from('exercises' as any)
      .select('id,name,gif_url,video_url')
      .in('id', exIds);
    (exs ?? []).forEach((e: any) => exMap.set(e.id, e));
  }

  const byDayId = new Map<string, any[]>();
  items.forEach((it) => {
    const arr = byDayId.get(it.plan_day_id) ?? [];
    arr.push({ ...it, exercise: exMap.get(it.exercise_id) || null });
    byDayId.set(it.plan_day_id, arr);
  });

  const composedDays =
    (days ?? [])
      .map((d: any) => ({
        id: d.id,
        day_index: d.day_index,
        items: (byDayId.get(d.id) ?? []).sort((a, b) => String(a.id).localeCompare(String(b.id))),
      }))
      .sort((a, b) => a.day_index - b.day_index);

  return { ...plan, days: composedDays };
}

export default async function PrintPlanPage({ params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');

  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role === 'CLIENT') redirect('/dashboard'); // Cliente não exporta

  const sb = createServerClient();
  const plan = await fetchPlan(sb, params.id);
  if (!plan) notFound();

  // PT só exporta se for o treinador do plano; ADMIN pode sempre
  if (role === 'PT' && plan.trainer_id !== me.id) redirect('/dashboard');

  const fmt = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString('pt-PT') : '—');

  return (
    <div style={{ padding: 16 }}>
      {/* Estilos de impressão minimalistas e scoped a esta página */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 16mm; }
              header, nav, aside, .no-print { display: none !important; }
              body { background: #fff; }
            }
            .brand-h { display:flex; align-items:center; gap:12px; }
            .grid-days { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
            .card { border:1px solid rgba(0,0,0,.12); border-radius:12px; padding:12px; }
            .muted { opacity:.7 }
          `,
        }}
      />

      {/* Branding header */}
      <Box className="brand-h" sx={{ mb: 1 }}>
        <Image src="/branding/hms-personal-trainer.svg" alt="HMS Personal Trainer" width={32} height={32} />
        <div>
          <Typography variant="h5" fontWeight={800}>Plano de treino</Typography>
          <Typography className="muted" variant="body2">
            Exportado em {new Date().toLocaleString('pt-PT')}
          </Typography>
        </div>
        <Box sx={{ flex: 1 }} />
        <Chip
          size="small"
          label={String(plan.status ?? 'ATIVO')}
          color={String(plan.status ?? '').toUpperCase() === 'ATIVO' ? 'success' : 'default'}
        />
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Metadados do plano */}
      <Box sx={{ display: 'grid', gap: .5, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {plan.title ?? 'Plano sem título'}
        </Typography>
        <Typography className="muted" variant="body2">
          Início: {fmt(plan.start_date)} · Fim: {fmt(plan.end_date)}
        </Typography>
      </Box>

      {/* Dias */}
      <section className="grid-days">
        {plan.days.map((d: any) => {
          const label = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][d.day_index] ?? `Dia ${d.day_index + 1}`;
          const totals = d.items.reduce(
            (acc: any, it: any) => {
              const sets = Number(it.sets || 0);
              const reps = Number(it.reps || 0);
              acc.series += sets;
              acc.reps += sets * reps;
              return acc;
            },
            { series: 0, reps: 0 }
          );

          return (
            <div key={d.id} className="card">
              <Typography fontWeight={700} sx={{ mb: .5 }}>{label}</Typography>
              <Typography className="muted" variant="caption" sx={{ display: 'block', mb: 1 }}>
                Totais dia — Séries: {totals.series} · Reps: {totals.reps}
              </Typography>

              {d.items.length === 0 && <Typography className="muted">Sem exercícios.</Typography>}

              {d.items.map((it: any, idx: number) => (
                <Box key={it.id} sx={{ display: 'grid', gap: .25, mb: .75 }}>
                  <Typography>
                    {idx + 1}. {it.exercise?.name ?? 'Exercício'}
                  </Typography>
                  <Typography className="muted" variant="caption">
                    Séries: {it.sets ?? '—'} · Reps: {it.reps ?? '—'} · Descanso: {it.rest_seconds ? `${it.rest_seconds}s` : '—'}
                  </Typography>
                  {it.notes && (
                    <Typography variant="caption">Nota do PT: {it.notes}</Typography>
                  )}
                </Box>
              ))}
            </div>
          );
        })}
      </section>

      {/* Dica de impressão */}
      <Box className="no-print" sx={{ mt: 1, textAlign: 'right' }}>
        <button onClick={() => window.print()} style={{ padding: '8px 12px', borderRadius: 8 }}>
          🖨️ Imprimir / Guardar PDF
        </button>
      </Box>
    </div>
  );
}
