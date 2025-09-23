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
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { getAdminDashboardStats } from '@/lib/stats';

export default async function AdminDashboard() {
  const sessionUser = await getSessionUserSafe();
  const user = sessionUser?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb.from('profiles').select('name, avatar_url').eq('id', user.id).maybeSingle();
  const name = prof?.name ?? user.name ?? user.email ?? 'Utilizador';

  const stats = await getAdminDashboardStats(user.id);
  const series: SignupsPoint[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 13 + i);
    return { date: format(d, 'dd/MM'), value: stats.perDay[i] ?? 0 };
  });

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} roleTag="ADMIN" />
      <AdminQuickActions />
      <LiveBanners />
      <PushBootstrap />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <KpiCard label="Clientes" value={stats.clients} variant="primary" icon="🧑‍🤝‍🧑" tooltip="Total (users/profiles)" />
        <KpiCard label="Treinadores" value={stats.trainers} variant="accent" icon="🏋️" tooltip="Inclui PT e TRAINER" />
        <KpiCard label="Pendentes" value={stats.pending} variant="warning" icon="⏳" tooltip="Aguardam aprovação" footer={<Link href="/dashboard/admin/approvals" className="text-xs">ver aprovações</Link>} />
        <KpiCard label="Novos hoje" value={stats.newToday} variant="info" icon="📈" tooltip="Registos de hoje" trend={stats.newTodayTrend.dir} trendValue={stats.newTodayTrend.sign} trendLabel="vs. ontem" />
        <KpiCard label="Sessões (7d)" value={stats.sessions7d} variant="success" icon="📅" tooltip="Total na próxima semana" trend={stats.sessionsTrend.dir} trendValue={stats.sessionsTrend.sign} trendLabel="vs. semana anterior" />
        <KpiCard label="Notificações" value={stats.unreadNotifs} variant="neutral" icon="🔔" tooltip="Por ler" />
        <KpiCard label="Clientes inativos ≥14d" value={Math.max(0, stats.clients - 0 /* calculado no stats se precisares */)} variant="danger" icon="⚠️" tooltip="Sem sessão nos últimos 14 dias" />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }} title="Últimos 14 dias — origem: users/profiles (fallback)">
            Inscrições por dia (últimos 14)
          </Typography>
          <AdminSignupsChart data={series} />
        </Paper>
      </div>

      <Suspense fallback={<SkeletonTable rows={6} cols={2} />}>
        <AdminWeekTable />
      </Suspense>

      <MotivationAdminCard />
    </div>
  );
}
