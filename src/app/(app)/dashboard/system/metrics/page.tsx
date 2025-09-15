// src/app/(app)/dashboard/system/metrics/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import KpiCard from '@/components/dashboard/KpiCard';

type SB = ReturnType<typeof createServerClient>;

/** Conta linhas com filtros opcionais, aplicados ANTES do select(count). */
async function safeCount(
  sb: SB,
  table: string,
  build?: (q: ReturnType<SB['from']> & any) => ReturnType<SB['from']> & any
) {
  try {
    // começa no from() para permitir encadear filtros (eq/gte/lt…)
    let q = sb.from(table) as any;
    if (build) q = build(q);
    // só agora pedimos o count
    const { count } = await q.select('*', { count: 'exact', head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function SystemMetricsPage() {
  // Sessão “flat”
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const [
    totalUsers,
    clients,
    trainers,
    admins,
    sessionsToday,
    sessions7d,
    notifs24h,
  ] = await Promise.all([
    safeCount(sb, 'users'),
    safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
    safeCount(sb, 'users', (q) => q.eq('role', 'PT')),
    safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
    safeCount(sb, 'sessions', (q) =>
      q.gte('scheduled_at', startOfToday.toISOString())
       .lte('scheduled_at', endOfToday.toISOString())
    ),
    safeCount(sb, 'sessions', (q) =>
      q.gte('scheduled_at', now.toISOString())
       .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) =>
      q.gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ),
  ]);

  // Últimos registos (lista)
  type Signup = { id: string; name: string | null; email: string; role: string | null; created_at: string | null };
  let lastSignups: Signup[] = [];
  try {
    const { data } = await sb
      .from('users')
      .select('id,name,email,role,created_at')
      .order('created_at', { ascending: false })
      .limit(6);
    lastSignups = (data ?? []) as Signup[];
  } catch {
    lastSignups = [];
  }

  type RecentSession = { id: string; scheduled_at: string | null; location: string | null; notes: string | null };
  let todaySessions: RecentSession[] = [];
  try {
    const { data } = await sb
      .from('sessions')
      .select('id,scheduled_at,location,notes')
      .gte('scheduled_at', startOfToday.toISOString())
      .lte('scheduled_at', endOfToday.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);
    todaySessions = (data ?? []) as RecentSession[];
  } catch {
    todaySessions = [];
  }

  return (
    <main className="p-4 space-y-4">
      <PageHeader title="📊 System Metrics" subtitle="Visão geral do sistema (ADMIN)" />

      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <KpiCard label="Utilizadores"        value={totalUsers}   variant="primary" />
        <KpiCard label="Clientes"            value={clients}      variant="accent" />
        <KpiCard label="Treinadores"         value={trainers}     variant="info" />
        <KpiCard label="Admins"              value={admins}       variant="neutral" />
        <KpiCard label="Sessões (hoje)"      value={sessionsToday} variant="success" />
        <KpiCard label="Sessões (7 dias)"    value={sessions7d}   variant="warning" />
        <KpiCard label="Notificações (24h)"  value={notifs24h}    variant="danger" />
      </div>

      {/* Últimos registos e sessões de hoje */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="font-semibold mb-2">👤 Novos registos</h3>
            {lastSignups.length === 0 ? (
              <div className="text-sm opacity-70">Sem registos recentes.</div>
            ) : (
              <ul className="space-y-2">
                {lastSignups.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.name ?? u.email}</div>
                      <div className="text-xs opacity-70">{u.role ?? '—'}</div>
                    </div>
                    <div className="text-xs opacity-70">
                      {u.created_at ? new Date(u.created_at).toLocaleString('pt-PT') : '—'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-semibold mb-2">📅 Sessões de hoje</h3>
            {todaySessions.length === 0 ? (
              <div className="text-sm opacity-70">Sem sessões marcadas para hoje.</div>
            ) : (
              <ul className="space-y-2">
                {todaySessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.notes?.trim() || 'Sessão'}</div>
                      {s.location && <div className="text-xs opacity-70 truncate">📍 {s.location}</div>}
                    </div>
                    <div className="text-xs opacity-70">
                      {s.scheduled_at
                        ? new Date(s.scheduled_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
