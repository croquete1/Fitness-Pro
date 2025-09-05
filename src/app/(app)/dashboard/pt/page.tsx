// src/app/(app)/dashboard/pt/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PTLiveSummaryClient from './ui/PTLiveSummaryClient';
import Link from 'next/link';
import type { Route } from 'next';

export default async function PTDashboardHome() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // carrega snapshot inicial (igual ao /api/pt/summary)
  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0,0,0,0);
  const endToday = new Date(startToday); endToday.setDate(endToday.getDate() + 1);

  const [{ data: today }, { data: links }, { count: plansUpdated }] = await Promise.all([
    sb.from('sessions').select('id, scheduled_at, duration_min, status')
      .eq('trainer_id', String(user.id))
      .neq('status', 'cancelada')
      .gte('scheduled_at', startToday.toISOString())
      .lt('scheduled_at', endToday.toISOString())
      .order('scheduled_at', { ascending: true }),
    sb.from('trainer_clients').select('client_id').eq('trainer_id', String(user.id)),
    sb.from('training_plans').select('*', { count: 'exact', head: true })
      .eq('trainer_id', String(user.id))
      .gte('updated_at', new Date(Date.now()-7*864e5).toISOString()),
  ]);

  const nextSession = (today ?? []).find(s => new Date(s.scheduled_at) > now);

  // semana próxima para mini-calendário
  const weekStart = (() => {
    const d = new Date(); const day = (d.getDay() + 6) % 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - day); return d;
  })();
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const { data: week } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min')
    .eq('trainer_id', String(user.id))
    .neq('status', 'cancelada')
    .gte('scheduled_at', weekStart.toISOString())
    .lt('scheduled_at', weekEnd.toISOString())
    .order('scheduled_at', { ascending: true });

  const initial = {
    todayCount: (today ?? []).length,
    nextAt: nextSession?.scheduled_at ?? null,
    activeClients: new Set((links ?? []).map((l: any) => l.client_id)).size,
    plansUpdated: plansUpdated ?? 0,
    week: (week ?? []).map((s: any) => ({
      id: s.id,
      start: s.scheduled_at,
      end: new Date(new Date(s.scheduled_at).getTime() + (Number(s.duration_min || 60) * 60_000)).toISOString(),
    })),
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Bem-vindo 👋</h1>
          <div className="text-muted">Resumo em tempo real e a tua semana de um relance.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn chip" href={'/dashboard/pt/sessions/new' as Route}>+ Marcar sessão</Link>
          <Link className="btn chip" href={'/dashboard/pt/sessions/calendar' as Route}>📅 Calendário</Link>
        </div>
      </div>

      <PTLiveSummaryClient initial={initial} />
    </div>
  );
}
