export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import PtQuickActions from '@/components/pt/PtQuickActions';
import PtWeekSessionsChart, { type PtPoint } from '@/components/pt/PtWeekSessionsChart';
import SkeletonTable from '@/components/skeletons/SkeletonTable';
import PtUpcomingTable from './_parts/PtUpcomingTable';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try { let q = sb.from(table).select('*', { count: 'exact', head: true }); if (build) q = build(q); const { count } = await q; return count ?? 0; }
  catch { return 0; }
}

function dirAndPct(curr: number, prev: number): { dir: 'up' | 'down' | 'flat'; sign: string } {
  const dir: 'up' | 'down' | 'flat' = curr > prev ? 'up' : curr < prev ? 'down' : 'flat';
  const pct = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
  const sign = pct > 0 ? `+${pct}%` : `${pct}%`;
  return { dir, sign };
}


export default async function PtDashboard() {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb.from('profiles').select('name').eq('id', user.id).maybeSingle();
  const name = prof?.name ?? user.name ?? user.email ?? 'Utilizador';

  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0,0,0,0);
  const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1);
  const endYesterday = new Date(startToday);

  const in7 = new Date(now); in7.setDate(now.getDate() + 7);
  const prev7Start = new Date(now); prev7Start.setDate(prev7Start.getDate() - 7);
  const prev7PrevStart = new Date(now); prev7PrevStart.setDate(prev7PrevStart.getDate() - 14);

  const [sessionsToday, sessions7d, unread, myClients, sessionsYesterday, sessionsPrev7] = await Promise.all([
    safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', user.id).gte('scheduled_at', startToday.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', user.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'notifications', (q: any) => q.eq('user_id', user.id).eq('read', false)),
    (async () => {
      const { data } = await sb.from('sessions').select('client_id').eq('trainer_id', user.id).gte('scheduled_at', startToday.toISOString());
      const s = new Set((data ?? []).map((r: any) => r.client_id).filter(Boolean));
      return s.size;
    })(),
    safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', user.id).gte('scheduled_at', startYesterday.toISOString()).lt('scheduled_at', endYesterday.toISOString())),
    safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', user.id).gte('scheduled_at', prev7PrevStart.toISOString()).lt('scheduled_at', prev7Start.toISOString())),
  ]);

  const todayTrend = dirAndPct(sessionsToday, sessionsYesterday);
  const weekTrend = dirAndPct(sessions7d, sessionsPrev7);

  const { data: rows } = await sb
    .from('sessions')
    .select('scheduled_at')
    .eq('trainer_id', user.id)
    .gte('scheduled_at', startToday.toISOString())
    .lt('scheduled_at', in7.toISOString());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startToday); d.setDate(d.getDate() + i);
    return format(d, 'dd/MM');
  });
  const counts = new Array<number>(7).fill(0);
  (rows ?? []).forEach((r: any) => {
    const d = new Date(r.scheduled_at); d.setHours(0,0,0,0);
    const idx = Math.round((+d - +startToday) / 86400000);
    if (idx >= 0 && idx < 7) counts[idx] += 1;
  });
  const series: PtPoint[] = days.map((d, i) => ({ date: d, value: counts[i] ?? 0 }));

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} roleTag="PT" />
      <PtQuickActions />
      <LiveBanners />
      <PushBootstrap />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <KpiCard
          label="Sessões hoje"
          value={sessionsToday}
          variant="info"
          icon="📆"
          tooltip="Sessões deste PT hoje"
          trend={todayTrend.dir}
          trendValue={todayTrend.sign}
          trendLabel="vs. ontem"
        />
        <KpiCard
          label="Sessões (7d)"
          value={sessions7d}
          variant="success"
          icon="📅"
          tooltip="Próximos 7 dias"
          trend={weekTrend.dir}
          trendValue={weekTrend.sign}
          trendLabel="vs. semana anterior"
        />
        <KpiCard label="Clientes ativos" value={myClients} variant="accent" icon="🧑‍🤝‍🧑" tooltip="Clientes com sessões/planos ativos" />
        <KpiCard label="Notificações" value={unread} variant="neutral" icon="🔔" tooltip="Por ler" />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ mb: 1 }}
            title="Próximos 7 dias — origem: sessions"
          >
            Sessões por dia (próximos 7)
          </Typography>
          <PtWeekSessionsChart data={series} />
        </Paper>
      </div>

      <Suspense fallback={<SkeletonTable rows={6} cols={4} />}>
        <PtUpcomingTable />
      </Suspense>
    </div>
  );
}
