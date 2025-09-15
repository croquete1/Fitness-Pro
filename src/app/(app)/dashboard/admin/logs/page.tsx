// src/app/(app)/dashboard/admin/logs/plans/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

// ⚠️ Se o teu nome de tabela for diferente (ex.: "plan_logs"),
// muda aqui e no .from(LOG_TABLE) abaixo:
const LOG_TABLE = 'plan_change_logs';

type PlanLogRow = {
  id: string;
  created_at: string | null;
  plan_id: string | null;
  action: string | null;        // ex.: CREATED | UPDATED_DAY | REORDER_EXERCISES | DELETED
  actor_id: string | null;
  actor_email: string | null;
  details: unknown | null;      // jsonb com diffs/outros metadados
};

function actionToVariant(action?: string | null) {
  const a = (action ?? '').toUpperCase();
  if (a.includes('DELETE') || a.includes('DELETED')) return 'warning' as const;
  if (a.includes('CREATE') || a.includes('CREATED')) return 'primary' as const;
  if (a.includes('REORDER') || a.includes('UPDATE')) return 'info' as const;
  return 'neutral' as const;
}

export default async function AdminPlanLogsPage() {
  // Guard: apenas ADMIN
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole(user?.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // Últimos 300 eventos
  const { data, error } = await sb
    .from(LOG_TABLE)
    .select('id, created_at, plan_id, action, actor_id, actor_email, details')
    .order('created_at', { ascending: false })
    .limit(300)
    .returns<PlanLogRow[]>();

  const rows = data ?? [];

  return (
    <div className="grid gap-4 p-4 md:p-6">
      <PageHeader
        title="📘 Histórico de Planos"
        subtitle="Alterações de planos (criação, reordenação, edição, remoção)."
      />

      <Toolbar
        left={
          <span className="text-sm opacity-80">
            Registos: <strong>{rows.length}</strong>
          </span>
        }
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/admin/logs"
              className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              ← Todos os logs
            </Link>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Admin
            </Link>
          </div>
        }
      />

      <Card>
        <CardContent>
          {error && (
            <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
              Não foi possível carregar os registos: {error.message}
            </div>
          )}

          {rows.length === 0 ? (
            <div className="py-10 text-center text-slate-500">Sem registos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Quando</th>
                    <th className="px-3 py-2 font-medium">Plano</th>
                    <th className="px-3 py-2 font-medium">Ação</th>
                    <th className="px-3 py-2 font-medium">Autor</th>
                    <th className="px-3 py-2 font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-200/70 dark:border-slate-800/70">
                      <td className="px-3 py-3 whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-3">
                        {r.plan_id ? (
                          <Link
                            href={`/dashboard/pt/plans/${r.plan_id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {r.plan_id}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={actionToVariant(r.action)}>
                          {r.action ?? '—'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {r.actor_email ?? r.actor_id ?? '—'}
                      </td>
                      <td className="px-3 py-3 max-w-[380px]">
                        <pre className="line-clamp-2 whitespace-pre-wrap break-words text-slate-600 dark:text-slate-300">
                          {r.details ? JSON.stringify(r.details) : '—'}
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
    </div>
  );
}
