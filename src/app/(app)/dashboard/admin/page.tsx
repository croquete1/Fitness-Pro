export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import AdminSignupsChart, { type SignupsPoint } from '@/components/admin/AdminSignupsChart';
import SkeletonTable from '@/components/skeletons/SkeletonTable';
import AdminWeekTable from './_parts/AdminWeekTable';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Conta por AppRole; para 'PT' procura 'PT' e 'TRAINER' na BD (users/profiles). */
async function countRole(sb: SB, role: AppRole) {
  if (role === 'PT') {
    let c = await safeCount(sb, 'users', (q: any) => q.in('role', ['PT', 'TRAINER']));
    if (c > 0) return c;
    return await safeCount(sb, 'profiles', (q: any) => q.in('role', ['PT', 'TRAINER']));
  }
  let c = await safeCount(sb, 'users', (q: any) => q.eq('role', role));
  if (c > 0) return c;
  return await safeCount(sb, 'profiles', (q: any) => q.eq('role', role));
}

/** 🔧 FIX: tipagem explícita do union para não ser widen para `string` */
function dirAndPct(curr: number, prev: number): { dir: 'up' | 'down' | 'flat'; sign: string } {
  const dir: 'up' | 'down' | 'flat' = curr > prev ? 'up' : curr < prev ? 'down' : 'flat';
  const pct = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
  const sign = pct > 0 ? `+${pct}%` : `${pct}%`;
  return { dir, sign };
}

export default async function AdminDashboard() {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) redirect('/login');
  const role = (toAppRole(user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb.from('profiles').select('name, avatar_url').eq('id', user.id).maybeSingle();

  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1);
  const endYesterday = new Date(startToday);

  const in7 = new Date(now); in7.setDate(now.getDate() + 7);
  const prev7Start = new Date(now); prev7Start.setDate(prev7Start.getDate() - 7);
  const prev7PrevStart = new Date(now); prev7PrevStart.setDate(prev7PrevStart.getDate() - 14);

  // KPIs base
  const [clients, trainers, sessions7d, unreadNotifs, pending, newToday] = await Promise.all([
    countRole(sb, 'CLIENT'),
    countRole(sb, 'PT'),
    safeCount(sb, 'sessions', (q: any) => q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'notifications', (q: any) => q.eq('user_id', user.id).eq('read', false)),
    (async () => {
      let c = await safeCount(sb, 'users', (q: any) => q.eq('approved', false));
      if (c === 0) c = await safeCount(sb, 'users', (q: any) => q.eq('status', 'PENDING'));
      if (c === 0) c = await safeCount(sb, 'profiles', (q: any) => q.eq('approved', false));
      return c;
    })(),
    (async () => {
      let c = await safeCount(sb, 'users', (q: any) => q.gte('created_at', startToday.toISOString()));
      if (c === 0) c = await safeCount(sb, 'profiles', (q: any) => q.gte('created_at', startToday.toISOString()));
      return c;
    })(),
  ]);

  // Tendências
  const [sessionsPrev7, newYesterday] = await Promise.all([
    safeCount(sb, 'sessions', (q: any) => q.gte('scheduled_at', prev7PrevStart.toISOString()).lt('scheduled_at', prev7Start.toISOString())),
    (async () => {
      let c = await safeCount(sb, 'users', (q: any) => q.gte('created_at', startYesterday.toISOString()).lt('created_at', endYesterday.toISOString()));
      if (c === 0) c = await safeCount(sb, 'profiles', (q: any) => q.gte('created_at', startYesterday.toISOString()).lt('created_at', endYesterday.toISOString()));
      return c;
    })(),
  ]);
  const sessionsTrend = dirAndPct(sessions7d, sessionsPrev7);
  const newTodayTrend = dirAndPct(newToday, newYesterday);

  // Série de inscrições (14d)
  const since14d = new Date(now); since14d.setDate(now.getDate() - 13); since14d.setHours(0, 0, 0, 0);
  const { data: regUsers } = await sb.from('users').select('id,created_at').gte('created_at', since14d.toISOString());
  const { data: regProf }  = regUsers?.length ? { data: null } : await sb.from('profiles').select('id,created_at').gte('created_at', since14d.toISOString());
  const regRows = (regUsers ?? regProf ?? []) as any[];

  const perDay = new Array<number>(14).fill(0);
  regRows.forEach((u: any) => {
    const d = new Date(u.created_at); d.setHours(0, 0, 0, 0);
    const idx = Math.round((+d - +since14d) / 86400000);
    if (idx >= 0 && idx < 14) perDay[idx] += 1;
  });
  const series: SignupsPoint[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since14d); d.setDate(d.getDate() + i);
    return { date: format(d, 'dd/MM'), value: perDay[i] ?? 0 };
  });

  // Inativos ≥14d
  const since14 = new Date(now); since14.setDate(now.getDate() - 14);
  const totalClients = await countRole(sb, 'CLIENT');
  const { data: actives } = await sb.from('sessions').select('client_id').gte('scheduled_at', since14.toISOString());
  const activeIds = new Set((actives ?? []).map((s: any) => s.client_id).filter(Boolean));
  const inactiveCount = Math.max(0, totalClients - activeIds.size);

  const name = prof?.name ?? user.name ?? user.email ?? 'Utilizador';

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} roleTag="ADMIN" />
      <AdminQuickActions />
      <LiveBanners />
      <PushBootstrap />

      {/* KPIs com tendências */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <KpiCard label="Clientes" value={clients} variant="primary" icon="🧑‍🤝‍🧑" tooltip="Total (users/profiles)" />
        <KpiCard label="Treinadores" value={trainers} variant="accent" icon="🏋️" tooltip="Inclui PT e TRAINER" />
        <KpiCard
          label="Pendentes"
          value={pending}
          variant="warning"
          icon="⏳"
          tooltip="Aguardam aprovação"
          footer={<Link href="/dashboard/admin/approvals" className="text-xs">ver aprovações</Link>}
        />
        <KpiCard
          label="Novos hoje"
          value={newToday}
          variant="info"
          icon="📈"
          tooltip="Registos de hoje"
          trend={newTodayTrend.dir}
          trendValue={newTodayTrend.sign}
          trendLabel="vs. ontem"
        />
        <KpiCard
          label="Sessões (7d)"
          value={sessions7d}
          variant="success"
          icon="📅"
          tooltip="Total na próxima semana"
          trend={sessionsTrend.dir}
          trendValue={sessionsTrend.sign}
          trendLabel="vs. semana anterior"
        />
        <KpiCard label="Notificações" value={unreadNotifs} variant="neutral" icon="🔔" tooltip="Por ler" />
        <KpiCard label="Clientes inativos ≥14d" value={inactiveCount} variant="danger" icon="⚠️" tooltip="Sem sessão nos últimos 14 dias" />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ mb: 1 }}
            title="Últimos 14 dias — origem: users/profiles (fallback)"
          >
            Inscrições por dia (últimos 14)
          </Typography>
          <AdminSignupsChart data={series} />
        </Paper>
      </div>

      {/* Sessões por PT (semana) com Suspense */}
      <Suspense fallback={<SkeletonTable rows={6} cols={2} />}>
        <AdminWeekTable />
      </Suspense>

      <MotivationAdminCard />
    </div>
  );
}
