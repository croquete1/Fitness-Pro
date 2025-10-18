// src/app/api/stats/route.ts
import { NextResponse } from 'next/server';

import { tryCreateServerClient } from '@/lib/supabaseServer';

type DashboardStat = {
  title: string;
  value: number;
  tone: 'primary' | 'accent' | 'info' | 'neutral';
  colorClass: string | null;
};

const FALLBACK_STATS: DashboardStat[] = [
  { title: 'Novos Utilizadores', value: 0, tone: 'primary', colorClass: null },
  { title: 'Pacotes activos', value: 0, tone: 'accent', colorClass: null },
  { title: 'Sessões (7 dias)', value: 0, tone: 'info', colorClass: null },
  { title: 'Notas (30 dias)', value: 0, tone: 'neutral', colorClass: null },
];

export async function GET() {
  const sb = tryCreateServerClient();
  if (!sb) {
    return NextResponse.json({ supabase: false, stats: FALLBACK_STATS });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAhead = new Date(now);
  sevenDaysAhead.setDate(now.getDate() + 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  try {
    const [newUsers, activePackages, sessionsWeek, notesMonth] = await Promise.all([
      sb
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString()),
      sb
        .from('client_packages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE'),
      sb
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .gte('start_time', now.toISOString())
        .lt('start_time', sevenDaysAhead.toISOString()),
      sb
        .from('client_notes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    const stats: DashboardStat[] = [
      {
        title: 'Novos Utilizadores',
        value: newUsers.count ?? 0,
        tone: 'primary',
        colorClass: null,
      },
      {
        title: 'Pacotes activos',
        value: activePackages.count ?? 0,
        tone: 'accent',
        colorClass: null,
      },
      {
        title: 'Sessões (7 dias)',
        value: sessionsWeek.count ?? 0,
        tone: 'info',
        colorClass: null,
      },
      {
        title: 'Notas (30 dias)',
        value: notesMonth.count ?? 0,
        tone: 'neutral',
        colorClass: null,
      },
    ];

    return NextResponse.json({ supabase: true, generatedAt: now.toISOString(), stats });
  } catch (error) {
    console.warn('[api/stats] fallback sample data', error);
    return NextResponse.json({ supabase: false, stats: FALLBACK_STATS });
  }
}
