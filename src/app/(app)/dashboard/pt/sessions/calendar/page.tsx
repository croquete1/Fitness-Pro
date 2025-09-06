// src/app/(app)/dashboard/pt/sessions/calendar/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import SchedulerClient from '../ui/SchedulerClient';

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - day);
  return d;
}

export default async function PTCalendarPage({ searchParams }: { searchParams?: { week?: string } }) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole((me as any).role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const weekStart = searchParams?.week ? new Date(searchParams.week) : startOfWeek();
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);

  const [{ data: ses }, blocks] = await Promise.all([
    sb
      .from('sessions')
      .select('id, scheduled_at, duration_min, status')
      .eq('trainer_id', String(me.id))
      .neq('status', 'cancelada')
      .gte('scheduled_at', weekStart.toISOString())
      .lt('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at', { ascending: true }),
    (async () => {
      try {
        const { data } = await sb
          .from('trainer_blocks')
          .select('start_at, end_at')
          .eq('trainer_id', String(me.id))
          .lte('start_at', weekEnd.toISOString())
          .gte('end_at', weekStart.toISOString());
        return data ?? [];
      } catch { return []; }
    })(),
  ]);

  const sessions = (ses ?? []).map((s: any) => {
    const st = new Date(s.scheduled_at);
    const en = new Date(st.getTime() + (Number(s.duration_min || 60) * 60_000));
    return { id: s.id, start: st.toISOString(), end: en.toISOString(), title: 'Sessão' };
  });

  const pb = blocks.map((b: any) => ({ start: b.start_at, end: b.end_at, title: 'Indisponível' }));

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Calendário (PT)</h1>
      <SchedulerClient weekStartIso={weekStart.toISOString()} sessions={sessions} blocks={pb} />
    </div>
  );
}
