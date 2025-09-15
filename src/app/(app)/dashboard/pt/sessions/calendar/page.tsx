// src/app/(app)/dashboard/pt/sessions/calendar/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

function startOfWeek(d: Date) {
  const c = new Date(d); const day = c.getDay();
  const diff = (day + 6) % 7; c.setDate(c.getDate() - diff); c.setHours(0,0,0,0); return c;
}
function monthMatrix(year: number, month0: number) {
  const first = new Date(year, month0, 1);
  const start = startOfWeek(first);
  const weeks: Date[][] = [];
  let cursor = new Date(start);
  while (true) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) { week.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); }
    weeks.push(week);
    if (cursor.getMonth() !== month0 && cursor.getDay() === 1) break;
  }
  return weeks;
}

export default async function PTSessionsCalendarPage() {
  const session = await getSessionUserSafe();
  const viewer = session;
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const today = new Date();
  const y = today.getFullYear(); const m0 = today.getMonth();
  const startMonth = new Date(y, m0, 1);
  const endMonth = new Date(y, m0 + 1, 1);

  // sessões do mês
  const { data: sess } = await sb
    .from('sessions')
    .select('id, scheduled_at')
    .gte('scheduled_at', startMonth.toISOString())
    .lt('scheduled_at', endMonth.toISOString())
    .eq('trainer_id', viewer.id);

  // folgas do mês
  const { data: offs } = await sb
    .from('pt_days_off')
    .select('date')
    .gte('date', startMonth.toISOString().slice(0,10))
    .lt('date', endMonth.toISOString().slice(0,10))
    .eq('trainer_id', viewer.id);

  const sessionsByDay = new Map<string, number>();
  (sess ?? []).forEach(s => {
    const d = new Date((s as any).scheduled_at).toDateString();
    sessionsByDay.set(d, (sessionsByDay.get(d) ?? 0) + 1);
  });
  const offSet = new Set((offs ?? []).map(o => new Date((o as any).date).toDateString()));

  const grid = monthMatrix(y, m0);

  return (
    <main className="p-4 grid gap-4">
      <PageHeader title="📆 Calendário" subtitle="As tuas sessões e dias de folga." />
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="font-bold">
              {today.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="text-xs opacity-70 flex gap-3">
              <span>● Sessões</span>
              <span className="text-rose-600">■ Folga</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs md:text-sm">
            {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d) => (
              <div key={d} className="py-1 font-semibold opacity-70">{d}</div>
            ))}
            {grid.flat().map((d, idx) => {
              const inMonth = d.getMonth() === m0;
              const key = d.toDateString();
              const count = sessionsByDay.get(key) ?? 0;
              const off = offSet.has(key);
              return (
                <div
                  key={idx}
                  className={[
                    'rounded-lg p-2 border text-left',
                    inMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-60',
                    off ? 'border-rose-300/60 ring-2 ring-rose-300/40' : 'border-slate-200 dark:border-slate-800'
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs opacity-70">{d.getDate()}</div>
                    {off && <div className="text-[10px] px-1 rounded bg-rose-500/10 text-rose-600">Folga</div>}
                  </div>
                  {count > 0 && (
                    <div className="mt-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded px-1 ring-1 ring-indigo-500/20 bg-indigo-500/10">
                        ● {count} sessão{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
