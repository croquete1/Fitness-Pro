// src/app/(app)/dashboard/pt/approvals/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import KpiCard from '@/components/dashboard/KpiCard';
import Link from 'next/link';

type SB = ReturnType<typeof createServerClient>;

type DraftPlan = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  updated_at: string | null;
};

/** Conta linhas com filtros opcionais (filtros ANTES do select(count)). */
async function safeCount(
  sb: SB,
  table: 'training_plans' | 'sessions' | 'users' | 'notifications',
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

export default async function ApprovalsPage() {
  // sessão “flat”
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login?callbackUrl=/dashboard/pt/approvals');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  // permitir PT (a tua app usa “PT”) e ADMIN. Se o utilizador tiver “TRAINER” no DB,
  // o toAppRole mapeia para 'PT', portanto fica coberto.
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // Quantos planos rascunho do treinador (potenciais “por aprovar/ativar”)
  const draftsCount = await safeCount(
    sb,
    'training_plans',
    (q) => q.eq('trainer_id', viewer.id).eq('status', 'DRAFT')
  );

  // Últimos 20 rascunhos para listar
  let drafts: DraftPlan[] = [];
  try {
    const { data } = await sb
      .from('training_plans')
      .select('id,title,status,client_id,updated_at')
      .eq('trainer_id', viewer.id)
      .eq('status', 'DRAFT')
      .order('updated_at', { ascending: false })
      .limit(20);

    drafts = (data ?? []) as DraftPlan[];
  } catch {
    drafts = [];
  }

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title="✅ Aprovações"
        subtitle="Planos em rascunho prontos para rever e ativar."
      />

      {/* KPI topo */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <KpiCard label="Rascunhos por aprovar" value={draftsCount} variant="warning" />
      </div>

      {/* Lista de rascunhos */}
      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2">📋 Planos em rascunho</h3>
          {drafts.length === 0 ? (
            <div className="text-sm opacity-70">Sem rascunhos no momento.</div>
          ) : (
            <ul className="space-y-2">
              {drafts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.title?.trim() || 'Sem título'}</div>
                    <div className="text-xs opacity-70">
                      Cliente: {p.client_id ?? '—'} • Atualizado:{' '}
                      {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Link para edição/ativação (rotas PT que já tens no projeto) */}
                    <Link href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">
                      Rever / Editar
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
