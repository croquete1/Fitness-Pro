export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import KpiCard from '@/components/dashboard/KpiCard';

type SB = ReturnType<typeof createServerClient>;

async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try {
    let q: any = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function PTPlansPage() {
  const user = await getSessionUserSafe();
  if (!user?.id) redirect('/login');
  const role = (toAppRole(user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT' && role !== 'TRAINER') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const [total, active, archived] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', user.id)),
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', user.id).eq('status', 'ACTIVE')),
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', user.id).eq('status', 'ARCHIVED')),
  ]);

  const { data: plans } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,client_id')
    .eq('trainer_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30);

  return (
    <div className="p-4 grid gap-3">
      <GreetingHeader
        name={prof?.name ?? user.name ?? user.email ?? 'Utilizador'}
        avatarUrl={prof?.avatar_url ?? null}
        role={role}
      />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
      >
        <KpiCard label="Todos" value={total} variant="primary" icon="🗂️" />
        <KpiCard label="Ativos" value={active} variant="success" icon="✅" />
        <KpiCard label="Arquivados" value={archived} variant="neutral" icon="📦" />
      </div>

      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm">
        <div className="p-3 border-b text-sm font-semibold">Planos recentes</div>
        <ul className="p-3 space-y-2">
          {(plans ?? []).map((p) => (
            <li key={p.id} className="rounded-lg border p-2 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">{(p as any).title ?? 'Sem título'}</div>
                <div className="text-xs opacity-70">
                  {(p as any).updated_at
                    ? new Date((p as any).updated_at).toLocaleString('pt-PT')
                    : '—'}
                </div>
              </div>
              <div className="text-xs opacity-80">
                Estado: {(p as any).status ?? '—'} · Cliente: {(p as any).client_id ?? '—'}
              </div>
            </li>
          ))}
          {(plans ?? []).length === 0 && (
            <li className="text-sm opacity-70 px-2 py-1">Ainda não tens planos.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
