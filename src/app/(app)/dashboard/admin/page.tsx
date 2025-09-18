// src/app/(app)/dashboard/admin/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;

async function safeCount(sb: SB, table: string, build?: (q: any) => any): Promise<number> {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const sessionUser = await getSessionUserSafe();
  const id = sessionUser?.user?.id;
  if (!id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') {
    if (role === 'PT') redirect('/dashboard/pt');
    redirect('/dashboard/clients');
  }

  const sb = createServerClient();

  // Perfil (nome/avatar)
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', id)
    .maybeSingle();

  // KPIs
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [clients, trainers, admins, sessions7d, unreadNotifs] = await Promise.all([
    safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
    safeCount(sb, 'users', (q) => q.in('role', ['PT', 'TRAINER'])),
    safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
    safeCount(
      sb,
      'sessions',
      (q) => q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', id).eq('read', false)),
  ]);

  // Histórico de sessões (últimas 500)
  type Sess = {
    id: string;
    scheduled_at: string | null;
    trainer_id: string | null;
    client_id: string | null;
    status: string | null;
    location: string | null;
  };

  const { data: sessRaw } = await sb
    .from('sessions')
    .select('id,scheduled_at,trainer_id,client_id,status,location')
    .order('scheduled_at', { ascending: false })
    .limit(500);

  const sessions = (sessRaw ?? []) as Sess[];

  // Mapa {id->nome} para PTs/Clientes
  const userIds = Array.from(
    new Set(
      [
        ...sessions.map((s) => s.trainer_id).filter(Boolean),
        ...sessions.map((s) => s.client_id).filter(Boolean),
      ] as string[]
    )
  );

  const usersMap = new Map<string, string>();
  if (userIds.length) {
    const { data: urows } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', userIds);
    (urows ?? []).forEach((u: any) => usersMap.set(u.id, u.name ?? u.email ?? u.id));
  }

  const name = prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador';

  return (
    <div className="p-4 grid gap-3">
      {/* NOVO greeting no estilo do template (header ficou limpo) */}
      <GreetingBanner name={name} role="ADMIN" />

      <LiveBanners />
      <PushBootstrap />

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}
      >
        <KpiCard label="Clientes" value={clients} variant="primary" icon="🧑‍🤝‍🧑" />
        <KpiCard label="Treinadores" value={trainers} variant="accent" icon="🏋️" />
        <KpiCard label="Admins" value={admins} variant="info" icon="🛡️" />
        <KpiCard label="Sessões (7d)" value={sessions7d} variant="success" icon="📅" />
        <KpiCard
          label="Notificações"
          value={unreadNotifs}
          variant="warning"
          icon="🔔"
          footer={<span className="text-muted small">por ler</span>}
        />
      </div>

      {/* Ações rápidas (corrigidos os links quebrados) */}
      <div className="card p-3">
        <div className="flex gap-2 flex-wrap">
          <Link className="btn chip" href="/dashboard/admin/users">👥 Utilizadores</Link>
          <Link className="btn chip" href="/dashboard/admin/approvals">✅ Aprovações</Link>
          <Link className="btn chip" href="/dashboard/admin/exercises">📚 Exercícios</Link>
          <Link className="btn chip" href="/dashboard/admin/plans">📝 Planos</Link>
          <Link className="btn chip" href="/dashboard/admin/pts-schedule">📅 Agenda PTs</Link>
          <Link className="btn chip" href="/dashboard/admin/notifications">🔔 Centro de notificações</Link>
          <Link className="btn chip" href="/dashboard/admin?tab=history">🗓️ Histórico</Link>
        </div>
      </div>

      {/* Auto-scroll para a secção de histórico quando abre com ?tab=history */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try{
                const u = new URL(window.location.href);
                if (u.searchParams.get('tab') === 'history') {
                  const el = document.getElementById('history');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }catch(e){}
            })();
          `,
        }}
      />

      {/* Histórico de sessões */}
      <div
        id="history"
        className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm"
      >
        <div className="p-3 border-b text-sm font-semibold flex items-center justify-between">
          <span>Histórico de sessões</span>
          <span className="text-xs opacity-70">{sessions.length} registos</span>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">PT</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Local</th>
                <th className="py-2 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-slate-200/70 dark:border-slate-800/70">
                  <td className="py-2 pr-4">
                    {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}
                  </td>
                  <td className="py-2 pr-4">
                    {s.trainer_id ? usersMap.get(s.trainer_id) ?? s.trainer_id : '—'}
                  </td>
                  <td className="py-2 pr-4">
                    {s.client_id ? usersMap.get(s.client_id) ?? s.client_id : '—'}
                  </td>
                  <td className="py-2 pr-4">{s.location ?? '—'}</td>
                  <td className="py-2 pr-4">
                    <span className="chip">{s.status ?? '—'}</span>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Sem sessões registadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
