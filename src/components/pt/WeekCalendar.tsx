'use client';
import * as React from 'react';

type Sess = {
  id: string;
  title: string;
  start_at: string;
  end_at?: string | null;
  kind?: string | null;
  status?: string | null;
  client?: { full_name?: string | null };
};

function getWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // segunda = 0
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0,0,0,0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return dt;
  });
  return days;
}

export default function WeekCalendar({ initialSessions }: { initialSessions: Sess[] }) {
  const [anchor, setAnchor] = React.useState(new Date());
  const [sessions, setSessions] = React.useState<Sess[]>(initialSessions);

  const week = getWeek(anchor);
  const byDay: Record<number, Sess[]> = Object.fromEntries(Array.from({length:7}, (_,i)=>[i,[]]));
  sessions.forEach(s => {
    const d = new Date(s.start_at);
    const idx = (d.getDay() + 6) % 7; // seg=0..dom=6
    const isSameWeek =
      d >= new Date(week[0].getTime()) &&
      d < new Date(week[6].getTime() + 24*60*60*1000);
    if (isSameWeek) byDay[idx].push(s);
  });

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-black/5 dark:bg-white/5">
        <button className="btn" onClick={()=>setAnchor(d=>{ const x=new Date(d); x.setDate(x.getDate()-7); return x;})}>◀ Semana</button>
        <div className="font-semibold">
          {week[0].toLocaleDateString([], { day:'2-digit', month:'short' })} – {week[6].toLocaleDateString([], { day:'2-digit', month:'short', year:'numeric' })}
        </div>
        <button className="btn" onClick={()=>setAnchor(d=>{ const x=new Date(d); x.setDate(x.getDate()+7); return x;})}>Semana ▶</button>
      </div>

      <div className="grid grid-cols-7 divide-x divide-black/10 dark:divide-white/10">
        {week.map((day, idx) => (
          <div key={idx} className="min-h-[280px]">
            <div className="px-3 py-2 text-sm font-semibold sticky top-0 bg-white dark:bg-neutral-900 border-b border-black/10 dark:border-white/10">
              {day.toLocaleDateString([], { weekday:'short', day:'2-digit' })}
            </div>
            <div className="p-2 space-y-2">
              {byDay[idx].length === 0 ? (
                <div className="text-xs opacity-60">—</div>
              ) : byDay[idx]
                .sort((a,b)=>+new Date(a.start_at)-+new Date(b.start_at))
                .map(s => (
                  <a key={s.id} href={`/dashboard/pt/sessions/${s.id}`} className="block rounded-lg border border-black/10 dark:border-white/10 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5">
                    <div className="font-medium">{s.title}{s.client?.full_name ? ` — ${s.client.full_name}` : ''}</div>
                    <div className="opacity-70">
                      {new Date(s.start_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      {s.end_at ? `–${new Date(s.end_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}` : ''}
                      {s.kind ? ` · ${s.kind}` : ''}{s.status ? ` · ${s.status}` : ''}
                    </div>
                  </a>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
