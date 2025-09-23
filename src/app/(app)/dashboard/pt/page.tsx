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

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { getPtDashboardStats } from '@/lib/stats';

export default async function PtDashboard() {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb.from('profiles').select('name').eq('id', user.id).maybeSingle();
  const name = prof?.name ?? user.name ?? user.email ?? 'Utilizador';

  const s = await getPtDashboardStats(user.id);
  const series: PtPoint[] = s.days.map((d, i) => ({ date: d, value: s.counts[i] ?? 0 }));

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} roleTag="PT" />
      <PtQuickActions />
      <LiveBanners />
      <PushBootstrap />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <KpiCard label="Sessões hoje" value={s.sessionsToday} variant="info" icon="📆" tooltip="Sessões deste PT hoje" trend={s.todayTrend.dir} trendValue={s.todayTrend.sign} trendLabel="vs. ontem" />
        <KpiCard label="Sessões (7d)" value={s.sessions7d} variant="success" icon="📅" tooltip="Próximos 7 dias" trend={s.weekTrend.dir} trendValue={s.weekTrend.sign} trendLabel="vs. semana anterior" />
        <KpiCard label="Clientes ativos" value={s.myClients} variant="accent" icon="🧑‍🤝‍🧑" tooltip="Clientes com sessões/planos ativos" />
        <KpiCard label="Notificações" value={s.unread} variant="neutral" icon="🔔" tooltip="Por ler" />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }} title="Próximos 7 dias — origem: sessions">
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
