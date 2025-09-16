// src/app/(app)/dashboard/my-plan/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingHeader from '@/components/dashboard/GreetingHeader';
import KpiCard from '@/components/dashboard/KpiCard';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';

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

type PlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
  trainer_id: string | null;
};

function formatDatePT(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export default async function MyPlanPage() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = (toAppRole(sessionUser.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const userId = sessionUser.user.id;

  // Perfil para Greeting
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [plans, upcoming, unread] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('client_id', userId)),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('client_id', userId)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', userId).eq('read', false)),
  ]);

  const { data: planList, error } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id')
    .eq('client_id', userId)
    .order('updated_at', { ascending: false })
    .limit(10)
    .returns<PlanRow[]>();

  const items = Array.isArray(planList) ? planList : [];

  return (
    <div className="p-4 grid gap-3">
      <GreetingHeader
        name={prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador'}
        avatarUrl={prof?.avatar_url ?? null}
        role={role}
      />

      <LiveBanners />
      <PushBootstrap />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
      >
        <KpiCard label="Planos" value={plans} variant="accent" icon="📝" />
        <KpiCard label="Sessões (7d)" value={upcoming} variant="success" icon="📅" />
        <KpiCard label="Notificações" value={unread} variant="warning" icon="🔔" />
      </div>

      <div
        className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm"
        role="region"
        aria-labelledby="my-plans-heading"
      >
        <div id="my-plans-heading" className="p-3 border-b text-sm font-semibold">
          Os meus planos
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700/90 dark:text-red-300" role="alert">
            Ocorreu um erro ao carregar os planos. Tenta novamente mais tarde.
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-3 text-sm opacity-70">Ainda não tens planos.</div>
        ) : (
          <ul className="p-3 space-y-2">
            {items.map((p) => (
              <li key={p.id} className="rounded-lg border p-2 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.title ?? 'Sem título'}</div>
                  <div className="text-xs opacity-70">{formatDatePT(p.updated_at)}</div>
                </div>
                <div className="text-xs opacity-80">
                  Estado: {p.status ?? '—'} · PT: {p.trainer_id ?? '—'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
