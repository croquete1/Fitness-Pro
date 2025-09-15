// src/app/(app)/dashboard/admin/logs/plans/page.tsx
export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { toAppRole } from '@/lib/roles';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { redirect } from 'next/navigation';
import Badge, { type Variant as BadgeVariant } from '@/components/ui/Badge';

type Row = {
  id: string;
  plan_id: string;
  actor_id: string | null;
  kind: string;
  payload: unknown | null;
  created_at: string;
};

function kindToVariant(kind: string): BadgeVariant {
  switch (kind) {
    case 'PLAN_CREATED':
    case 'DAY_ADDED':
    case 'EXERCISE_ADDED':
      return 'success';

    case 'PLAN_TITLE_CHANGED':
    case 'DAY_RENAMED':
      return 'accent';

    case 'PLAN_STATUS_CHANGED':
    case 'DAY_MOVED':
    case 'EXERCISE_MOVED':
      return 'info';

    case 'EXERCISE_UPDATED':
      return 'primary';

    case 'EXERCISE_REMOVED':
    case 'DAY_REMOVED':
    case 'PLAN_ARCHIVED':
      return 'danger';

    default:
      return 'neutral';
  }
}

function q(base: string, params: Record<string, string | undefined>) {
  const u = new URL(base, 'http://x'); // base dummy para construir query
  Object.entries(params).forEach(([k, v]) => {
    if (v) u.searchParams.set(k, v);
    else u.searchParams.delete(k);
  });
  return u.search; // apenas ?a=b
}

export default async function PlanLogsPage({ searchParams }: { searchParams?: Record<string, string | undefined> }) {
  // Guard simples (SSR)
  const session = await getSessionUserSafe();
  if (!session?.id) redirect('/login');
  if ((toAppRole(session.role) ?? 'CLIENT') !== 'ADMIN') redirect('/dashboard');

  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host')!;
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const base = `${proto}://${host}`;

  const limit = searchParams?.limit ?? '50';
  const plan_id = searchParams?.plan_id;
  const actor_id = searchParams?.actor_id;
  const kind = searchParams?.kind;
  const since = searchParams?.since;

  const qs = q('/api/admin/plan-changes', { limit, plan_id, actor_id, kind, since });
  const res = await fetch(`${base}/api/admin/plan-changes${qs}`, { cache: 'no-store' });
  const payload = await res.json().catch(() => ({ ok: false, items: [], count: 0 }));
  const items = (payload?.items ?? []) as Row[];
  const count = (payload?.count ?? items.length) as number;

  // gerar chips de kinds a partir dos resultados atuais
  const kindSet = Array.from(new Set(items.map(i => i.kind))).slice(0, 12);

  return (
    <main className="p-4 space-y-4">
      <PageHeader title="📜 Logs de Planos" subtitle="Histórico de alterações aos planos de treino" />

      <Card>
        <CardContent className="space-y-3">
          <form method="GET" className="grid gap-3 md:grid-cols-4">
            <input
              name="plan_id"
              defaultValue={plan_id ?? ''}
              placeholder="Filtrar por Plan ID"
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2"
            />
            <input
              name="actor_id"
              defaultValue={actor_id ?? ''}
              placeholder="Filtrar por Actor ID"
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2"
            />
            <input
              type="datetime-local"
              name="since"
              defaultValue={since ?? ''}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2"
            />
            <div className="flex gap-2">
              <select
                name="limit"
                defaultValue={limit}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2"
              >
                {['25','50','100','200'].map(n => <option key={n} value={n}>{n} registos</option>)}
              </select>
              <button className="rounded-lg px-3 py-2 bg-indigo-600 text-white font-semibold">Aplicar</button>
            </div>
          </form>

          {kindSet.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={q('/dashboard/admin/logs/plans', { plan_id, actor_id, since, limit })}
                className={`btn chip ${!kind ? 'ring-2 ring-indigo-500' : ''}`}
              >
                Todas
              </a>
              {kindSet.map(k => (
                <a
                  key={k}
                  href={q('/dashboard/admin/logs/plans', { plan_id, actor_id, since, limit, kind: k })}
                  className={`btn chip ${kind === k ? 'ring-2 ring-indigo-500' : ''}`}
                  title={k}
                >
                  <span className="truncate max-w-[22ch]">{k}</span>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between pb-2">
            <div className="text-sm opacity-70">Encontrados: <strong>{count}</strong></div>
          </div>

          {items.length === 0 ? (
            <div className="text-sm opacity-70">Sem registos para os filtros atuais.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="text-left text-sm opacity-70">
                  <tr>
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Plano</th>
                    <th className="py-2 pr-3">Ator</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString('pt-PT')}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{r.plan_id}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{r.actor_id ?? '—'}</td>
                      <td className="py-2 pr-3">
                        <Badge variant={kindToVariant(r.kind)}>{r.kind}</Badge>
                      </td>
                      <td className="py-2 pr-3 text-sm">
                        <pre className="max-w-[60ch] whitespace-pre-wrap break-words opacity-80 text-xs">
                          {JSON.stringify(r.payload ?? {}, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
