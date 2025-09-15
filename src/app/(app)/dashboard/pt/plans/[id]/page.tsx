export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type Plan = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  trainer_id: string | null;
  updated_at: string | null;
};

function statusBadgeColor(s: Plan['status']) {
  switch (s) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20';
    case 'DRAFT':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20';
    case 'ARCHIVED':
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/20';
  }
}

export default async function PTPlanViewPage({ params }: { params: { id: string } }) {
  // sessão (SessionUser já vem “flat”: id/role/email)
  const me = await getSessionUserSafe();
  if (!me?.id) redirect('/login' as Route);

  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();

  // carrega plano
  const { data, error } = await sb
    .from('training_plans')
    .select('id, title, status, client_id, trainer_id, updated_at')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !data) return notFound();

  const plan: Plan = data as Plan;

  // se for PT, certifica que é o dono do plano
  if (role === 'PT' && plan.trainer_id && plan.trainer_id !== String(me.id)) {
    redirect('/dashboard/pt/plans' as Route);
  }

  const updated = plan.updated_at ? new Date(plan.updated_at).toLocaleString() : '—';

  return (
    <main className="p-4 md:p-6 space-y-4">
      {/* Header bonito */}
      <div className="rounded-2xl p-4 md:p-6 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 text-white shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {plan.title ?? 'Plano'}
            </h1>
            <p className="text-sm opacity-80">ID: {plan.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColor(plan.status)}`}>
              {plan.status ?? '—'}
            </span>
            <Link
              href={`/dashboard/pt/plans/${plan.id}/edit` as Route}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-semibold"
            >
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="text-xs opacity-70 mb-1">Cliente</div>
            <div className="font-semibold">{plan.client_id ?? '—'}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="text-xs opacity-70 mb-1">Treinador</div>
            <div className="font-semibold">{plan.trainer_id ?? '—'}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="text-xs opacity-70 mb-1">Última atualização</div>
            <div className="font-semibold">{updated}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="text-xs opacity-70 mb-1">Ações</div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/pt/plans/${plan.id}/edit` as Route}
                className="btn chip"
              >
                ✏️ Editar
              </Link>
              <Link
                href={'/dashboard/pt/plans' as Route}
                className="btn chip"
              >
                ← Voltar
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
