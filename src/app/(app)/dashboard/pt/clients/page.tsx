// src/app/(app)/dashboard/pt/clients/page.tsx
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

type ClientRow = {
  client_id: string;
  clients: {
    id: string;
    name: string | null;
    email: string;
    created_at: string | null;
  } | null;
};

function formatDatePT(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export default async function PTClientsPage() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = (toAppRole(sessionUser.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

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

  const [myClients, myPlans, myUpcoming, unread] = await Promise.all([
    safeCount(sb, 'trainer_clients', (q) => q.eq('trainer_id', userId)),
    safeCount(sb, 'training_plans', (q) => q.eq('trainer_id', userId)),
    safeCount(
      sb,
      'sessions',
      (q) =>
        q
          .eq('trainer_id', userId)
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', userId).eq('read', false)),
  ]);

  // lista rápida (top 20) dos meus clientes
  const { data: rowsData, error: rowsError } = await sb
    .from('trainer_clients')
    .select('client_id, clients:users(id,name,email,created_at)')
    .eq('trainer_id', userId)
    .limit(20)
    .returns<ClientRow[]>();

  const rows: ClientRow[] = Array.isArray(rowsData) ? rowsData : [];

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
        <KpiCard label="Clientes" value={myClients} variant="primary" icon="👥" />
        <KpiCard label="Planos" value={myPlans} variant="accent" icon="📝" />
        <KpiCard label="Sessões (7d)" value={myUpcoming} variant="success" icon="📅" />
        <KpiCard
          label="Notificações"
          value={unread}
          variant="warning"
          icon="🔔"
          footer={<span className="small text-muted">por ler</span>}
        />
      </div>

      <div
        className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm"
        role="region"
        aria-labelledby="pt-clients-heading"
      >
        <div id="pt-clients-heading" className="p-3 border-b text-sm font-semibold">
          Os meus clientes
        </div>

        {rowsError && (
          <div className="p-3 text-sm text-red-700/90 dark:text-red-300" role="alert">
            Ocorreu um erro ao carregar os clientes. Tenta novamente mais tarde.
          </div>
        )}

        <ul className="p-3 space-y-2">
          {rows.map((r) => (
            <li key={r.client_id} className="rounded-lg border p-2 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {r.clients?.name ?? r.clients?.email ?? r.client_id}
                </div>
                <div className="text-xs opacity-70">
                  {formatDatePT(r.clients?.created_at ?? null)}
                </div>
              </div>
              <div className="text-xs opacity-80">{r.clients?.email ?? '—'}</div>
            </li>
          ))}
          {rows.length === 0 && !rowsError && (
            <li className="text-sm opacity-70 px-2 py-1">Sem clientes associados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
