export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import MotivationCard from '@/components/dashboard/MotivationCard';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import ClientQuickActions from '@/components/client/ClientQuickActions';
import ClientProgressChart, { type ProgressPoint } from '@/components/client/ClientProgressChart';
import SkeletonTable from '@/components/skeletons/SkeletonTable';
import ClientUpcomingTable from './_parts/ClientUpcomingTable';

import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { format } from 'date-fns';
import { getClientDashboardStats } from '@/lib/stats';

export default async function ClientDashboard() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) redirect('/login');

  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb.from('profiles').select('name, avatar_url').eq('id', me.id).maybeSingle();
  const name = prof?.name ?? me.name ?? me.email ?? 'Utilizador';

  const s = await getClientDashboardStats(me.id);

  // Progresso (peso) — mantemos o teu loader
  async function loadHistory(): Promise<ProgressPoint[]> {
    const candidates = [
      ['profile_metrics_history', 'measured_at'],
      ['metrics_history', 'measured_at'],
      ['metrics_log', 'created_at'],
    ] as const;
    for (const [table, dateCol] of candidates) {
      try {
        const { data } = await sb.from(table as any).select(`user_id, ${dateCol}, weight_kg`).eq('user_id', me.id).order(dateCol as any, { ascending: true }).limit(24);
        if (data?.length) return (data as any[]).map((r) => ({ date: format(new Date(r[dateCol]), 'dd/MM'), weight: r.weight_kg ?? null }));
      } catch {}
    }
    try {
      const { data } = await sb.from('profile_metrics').select('weight_kg, updated_at').eq('user_id', me.id).maybeSingle();
      if (data) return [{ date: format(new Date(data.updated_at ?? Date.now()), 'dd/MM'), weight: data.weight_kg ?? null }];
    } catch {}
    return [];
  }
  const points = await loadHistory();

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} />
      <ClientQuickActions />
      <LiveBanners />
      <PushBootstrap />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <KpiCard label="Os meus planos" value={s.myPlans} variant="accent" icon="📝" tooltip="Planos atribuídos a mim" />
        <KpiCard label="Sessões (7d)" value={s.myUpcoming} variant="success" icon="📅" tooltip="Sessões marcadas na próxima semana" trend={s.weekTrend.dir} trendValue={s.weekTrend.sign} trendLabel="vs. semana anterior" />
        <KpiCard label="Notificações" value={s.unread} variant="neutral" icon="🔔" tooltip="Por ler" />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }} title="Série temporal do teu peso — origem: *metrics*_history/profile_metrics">
            Progresso (peso)
          </Typography>
          <ClientProgressChart data={points} />
        </Paper>
      </div>

      <Suspense fallback={<SkeletonTable rows={6} cols={4} />}>
        <ClientUpcomingTable />
      </Suspense>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }} title="Mensagens motivacionais e dicas">
          Dicas e motivação
        </Typography>
        <MotivationCard />
      </Paper>
    </div>
  );
}
