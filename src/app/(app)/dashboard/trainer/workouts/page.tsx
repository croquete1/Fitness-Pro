// src/app/(app)/dashboard/trainer/workouts/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import KpiCard from '@/components/dashboard/KpiCard';

type SB = ReturnType<typeof createServerClient>;

type Plan = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  updated_at: string | null;
};

/** Conta registos com filtros aplicados antes do select(count). */
async function safeCount(
  sb: SB,
  table: 'training_plans' | 'sessions' | 'notifications' | 'users',
  build?: (q: ReturnType<SB['from']> & any) => ReturnType<SB['from']> & any
) {
  try {
    let q = sb.from(table) as any;
    if (build) q = build(q);
    const { count } = await q.select('*', { count: 'exact', head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function WorkoutsPage() {
  // Sessão “flat”
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login?callbackUrl=/dashboard/trainer/workouts');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(in7.getDate() + 7);

  // KPIs: rascunhos, ativos e sessões na próxima semana
  const [drafts, active, sessions7d] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', viewer.id).eq('status', 'DRAFT')),
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', viewer.id).eq('status', 'ACTIVE')),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('trainer_id', viewer.id)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
  ]);

  // Últimos planos do treinador (ativos primeiro)
  let plans: Plan[] = [];
  try {
    const { data } = await sb
      .from('training_plans')
      .select('id,title,status,client_id,updated_at')
      .eq('trainer_id', viewer.id)
      .order('status', { ascending: true }) // DRAFT, depois ACTIVE, etc — ajusta se quiseres
      .order('updated_at', { ascending: false })
      .limit(30);
    plans = (data ?? []) as Plan[];
  } catch {
    plans = [];
  }

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title="🏋️ Workouts"
        subtitle="Gerir e editar os teus planos de treino."
        actions={
          <Link href="/dashboard/pt/plans/new" className="btn chip">
            + Novo Plano
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <KpiCard label="Planos ativos" value={active} variant="success" />
        <KpiCard label="Rascunhos" value={drafts} variant="warning" />
        <KpiCard label="Sessões (7d)" value={sessions7d} variant="info" />
      </div>

      {/* Lista de planos */}
      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2">📋 Os teus planos</h3>
          {plans.length === 0 ? (
            <div className="text-sm opacity-70">Ainda não tens planos. Cria o primeiro para começares.</div>
          ) : (
            <ul className="space-y-2">
              {plans.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.title?.trim() || 'Sem título'}</div>
                    <div className="text-xs opacity-70">
                      Estado: {p.status ?? '—'} • Cliente: {p.client_id ?? '—'} • Atualizado:{' '}
                      {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/pt/plans/${p.id}`} className="btn chip">
                      Ver
                    </Link>
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">
                      Editar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
