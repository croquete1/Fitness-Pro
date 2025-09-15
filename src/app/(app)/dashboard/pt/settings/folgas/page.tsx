// src/app/(app)/dashboard/pt/settings/folgas/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import FolgaForm from './FolgaForm';
import EditFolgaButton from './EditFolgaButton';

type DayOff = {
  id: string;
  trainer_id: string;
  date: string; // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

function startOfWeek(d: Date) {
  const c = new Date(d); const day = c.getDay(); // 0=Dom
  const diff = (day + 6) % 7; // segunda como início
  c.setDate(c.getDate() - diff);
  c.setHours(0,0,0,0);
  return c;
}
function endOfWeek(d: Date) {
  const s = startOfWeek(d); const e = new Date(s);
  e.setDate(s.getDate() + 7); e.setHours(0,0,0,0);
  return e;
}
function hoursBetween(hhmmA: string, hhmmB: string) {
  // retorna horas (float) entre HH:MM
  const [h1, m1] = hhmmA.split(':').map(Number);
  const [h2, m2] = hhmmB.split(':').map(Number);
  return (h2 + m2/60) - (h1 + m1/60);
}
function monthMatrix(year: number, month0: number) {
  // devolve matriz (semanas x dias) com Date
  const first = new Date(year, month0, 1);
  const start = startOfWeek(first);
  const weeks: Date[][] = [];
  let cursor = new Date(start);
  while (true) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month0 && cursor.getDay() === 1) break; // saiu do mês e voltou à 2ª
  }
  return weeks;
}

export default async function FolgasPage() {
  const session = await getSessionUserSafe();
  const viewer = session; // SessionUser “flat”
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();

  // Carregar folgas do próprio PT (ou todas se ADMIN)
  const base = sb
    .from('pt_days_off')
    .select('id, trainer_id, date, start_time, end_time, reason')
    .order('date', { ascending: true });

  const { data: raw } =
    role === 'ADMIN'
      ? await base
      : await base.eq('trainer_id', viewer.id);

  const folgas = (raw ?? []) as DayOff[];

  // KPIs
  const today = new Date();
  const sw = startOfWeek(today), ew = endOfWeek(today);
  const proximasFolgas = folgas.filter(f => new Date(f.date) >= new Date(today.toDateString())).length;

  const horasSemana = folgas.reduce((acc, f) => {
    const d = new Date(f.date);
    if (d >= sw && d < ew) {
      let h = 8; // se não houver horas, consideramos 8h (dia de trabalho)
      if (f.start_time && f.end_time) {
        const delta = hoursBetween(f.start_time, f.end_time);
        h = Math.max(0, Math.min(24, delta || 0));
      }
      return acc + h;
    }
    return acc;
  }, 0);

  // Calendário (mês corrente)
  const y = today.getFullYear();
  const m0 = today.getMonth();
  const grid = monthMatrix(y, m0);
  const setFolgas = new Set(folgas.map(f => new Date(f.date).toDateString()));

  return (
    <main className="p-4 grid gap-4">
      <PageHeader
        title="🗓️ Folgas"
        subtitle="Gere os teus dias/horas indisponíveis para marcações."
      />

      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-600/10 via-indigo-500/10 to-indigo-400/10 ring-1 ring-indigo-500/20">
          <div className="text-xs opacity-80">Próximas folgas</div>
          <div className="text-2xl font-extrabold mt-1">{proximasFolgas}</div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600/10 via-emerald-500/10 to-emerald-400/10 ring-1 ring-emerald-500/20">
          <div className="text-xs opacity-80">Horas indisponíveis (esta semana)</div>
          <div className="text-2xl font-extrabold mt-1">{horasSemana.toFixed(1)}h</div>
        </div>
      </div>

      {/* Criar nova folga */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="font-bold">Adicionar folga</h3>
          <FolgaForm />
        </CardContent>
      </Card>

      {/* Calendário mês atual */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="font-bold">
              Calendário — {today.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="text-xs opacity-70">Dias com destaque: folgas</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs md:text-sm">
            {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d) => (
              <div key={d} className="py-1 font-semibold opacity-70">{d}</div>
            ))}
            {grid.flat().map((d, idx) => {
              const inMonth = d.getMonth() === m0;
              const key = d.toDateString();
              const isFolga = setFolgas.has(key);
              return (
                <div
                  key={idx}
                  className={[
                    'rounded-lg p-2 border',
                    inMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/40 opacity-60',
                    isFolga ? 'border-rose-300/60 ring-2 ring-rose-300/40' : 'border-slate-200 dark:border-slate-800'
                  ].join(' ')}
                >
                  <div className="text-xs opacity-70">{d.getDate()}</div>
                  {isFolga && <div className="mt-1 text-[10px] px-1 rounded bg-rose-500/10 text-rose-600">Folga</div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de folgas futuras (editáveis) */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="font-bold">Próximas folgas</h3>
          {folgas.length === 0 ? (
            <div className="text-sm opacity-70">Sem folgas registadas.</div>
          ) : (
            <ul className="grid gap-2">
              {folgas.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                  <div>
                    <div className="font-medium">
                      {new Date(f.date).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </div>
                    <div className="text-xs opacity-70">
                      {f.start_time && f.end_time ? `${f.start_time}–${f.end_time}` : 'Dia inteiro'}
                      {f.reason ? ` · ${f.reason}` : ''}
                    </div>
                  </div>
                  <EditFolgaButton folgaId={f.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
