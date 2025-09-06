'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type ClientOpt = { id: string; name?: string | null; email: string };
type LocationOpt = { id: string; name: string; travel_min?: number | null };
export type WeekItem = {
  id: string;
  start: string;   // ISO
  end: string;     // ISO
  location_id?: string | null;
  client_id?: string | null;
  title?: string | null;
};
export type Block = { id: string; start: string; end: string; title?: string | null };

type Props = {
  weekStartIso?: string;
  sessions?: WeekItem[];
  blocks?: Block[];
  clients?: ClientOpt[];
  locations?: LocationOpt[];
};

function startOfWeek(date = new Date()) { const d = new Date(date); const day = d.getDay() || 7; if (day !== 1) d.setDate(d.getDate() - (day - 1)); d.setHours(0,0,0,0); return d; }
function fmtHour(d: Date) { return d.toTimeString().slice(0,5); }
function addMin(d: Date, min: number) { const x = new Date(d); x.setMinutes(x.getMinutes() + min); return x; }
function toIso(d: Date) { return new Date(d).toISOString(); }
function overlap(aS: Date, aE: Date, bS: Date, bE: Date) { return aS < bE && bS < aE; }
function sameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

export default function SchedulerClient({
  weekStartIso,
  sessions = [],
  blocks = [],
  clients = [],
  locations = [],
}: Props) {
  const router = useRouter();

  // estado local das sessões (optimistic)
  const [localSessions, setLocalSessions] = React.useState<WeekItem[]>(sessions);
  React.useEffect(() => { setLocalSessions(sessions); }, [sessions]);

  const weekStart = React.useMemo(() => weekStartIso ? new Date(weekStartIso) : startOfWeek(new Date()), [weekStartIso]);
  const hours = React.useMemo(() => { const arr: Date[] = []; const base = new Date(weekStart); base.setHours(8,0,0,0); for (let i=0;i<26;i++) arr.push(addMin(base, i*30)); return arr; }, [weekStart]);
  const days = React.useMemo(() => Array.from({length:7},(_,i)=>{const d=new Date(weekStart); d.setDate(d.getDate()+i); return d;}), [weekStart]);

  // drag-select
  const [dragging, setDragging] = React.useState(false);
  const [anchor, setAnchor] = React.useState<Date | null>(null);
  const [hover, setHover] = React.useState<Date | null>(null);

  // modal
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [clientId, setClientId] = React.useState<string>('');
  const [locationId, setLocationId] = React.useState<string>('');
  const [duration, setDuration] = React.useState<number>(60);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // toasts
  const [toast, setToast] = React.useState<string | null>(null);
  const pushToast = (msg: string) => { setToast(msg); window.setTimeout(()=>setToast(null), 3000); };

  const travelOf = React.useCallback((locId?: string | null) => {
    const loc = locations.find(l => l.id === locId);
    return Math.max(0, Number(loc?.travel_min ?? 0));
  }, [locations]);

  const cellDate = React.useCallback((dayIdx: number, slotIdx: number) => {
    const d = new Date(days[dayIdx]);
    const h = new Date(hours[slotIdx]);
    d.setHours(h.getHours(), h.getMinutes(), 0, 0);
    return d;
  }, [days, hours]);

  const checkConflicts = React.useCallback((start: Date, end: Date, pickedLocation?: string | null) => {
    const reasons: string[] = [];
    for (const bl of blocks) {
      const bs = new Date(bl.start), be = new Date(bl.end);
      if (overlap(start, end, bs, be)) { reasons.push(`Conflito com folga: ${bl.title ?? 'Folga'}`); break; }
    }
    const sameDaySessions = localSessions.map(s => ({...s,_s:new Date(s.start),_e:new Date(s.end)})).filter(s => sameDay(s._s, start));
    for (const s of sameDaySessions) {
      if (overlap(start, end, s._s, s._e)) reasons.push(`Conflito com sessão (${fmtHour(s._s)}–${fmtHour(s._e)})`);
      if (s._e <= start) {
        const need = (s.location_id && pickedLocation && s.location_id !== pickedLocation) ? Math.max(travelOf(s.location_id), travelOf(pickedLocation)) : 0;
        if (need>0 && start < addMin(s._e, need)) reasons.push(`Precisas de ${need} min de deslocação após a sessão anterior.`);
      }
      if (end <= s._s) {
        const need = (s.location_id && pickedLocation && s.location_id !== pickedLocation) ? Math.max(travelOf(s.location_id), travelOf(pickedLocation)) : 0;
        if (need>0 && addMin(end, need) > s._s) reasons.push(`Precisas de ${need} min de deslocação antes da sessão seguinte.`);
      }
    }
    return reasons;
  }, [blocks, localSessions, travelOf]);

  const onDown = (c: number, r: number) => { const d = cellDate(c, r); setDragging(true); setAnchor(d); setHover(d); };
  const onEnter = (c: number, r: number) => { if (!dragging) return; setHover(cellDate(c, r)); };
  const onUp = () => {
    if (!dragging || !anchor || !hover) { setDragging(false); return; }
    const a = anchor < hover ? anchor : hover;
    const b = anchor < hover ? hover : anchor;
    const end = addMin(b, 30);
    setRange({ start: a, end });
    setOpen(true);
    setDragging(false);
  };

  const isSelected = React.useCallback((c: number, r: number) => {
    if (!dragging || !anchor || !hover) return false;
    const d = cellDate(c, r);
    const s = anchor < hover ? anchor : hover;
    const e = anchor < hover ? hover : anchor;
    return d >= s && d <= e;
  }, [dragging, anchor, hover, cellDate]);

  const sessionsByDay = React.useMemo(() => {
    const map: Record<number, WeekItem[]> = {}; days.forEach((_,i)=>{map[i]=[];});
    localSessions.forEach(s => { const sd = new Date(s.start); const idx = Math.floor((sd.getTime() - days[0].getTime()) / (24*3600*1000)); if (idx>=0 && idx<7) map[idx].push(s); });
    return map;
  }, [localSessions, days]);

  async function createSession() {
    if (!range) return;
    setBusy(true); setErr(null);
    const start = range.start;
    const end = addMin(range.start, duration);

    const reasons = checkConflicts(start, end, locationId || undefined);
    if (reasons.length) { setBusy(false); setErr(reasons.join('\n')); return; }

    // optimistic
    const tempId = `temp-${Date.now()}`;
    const optimistic: WeekItem = { id: tempId, start: toIso(start), end: toIso(end), client_id: clientId || null, location_id: locationId || null, title: null };
    setLocalSessions(prev => [...prev, optimistic]);

    const res = await fetch('/api/pt/sessions', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ start: optimistic.start, end: optimistic.end, client_id: optimistic.client_id, location_id: optimistic.location_id }),
    });

    if (!res.ok) {
      // rollback
      setLocalSessions(prev => prev.filter(s => s.id !== tempId));
      setBusy(false);
      setErr(await res.text());
      return;
    }

    const json = await res.json().catch(() => ({}));
    const created = json.session as WeekItem | undefined;

    // swap temp -> created
    if (created?.id) {
      setLocalSessions(prev => prev.map(s => s.id === tempId ? created : s));
    }
    setBusy(false);
    setOpen(false);
    pushToast('✅ Sessão criada');
    router.refresh?.();
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* toasts */}
      {toast && (
        <div className="toast-viewport">
          <div className="toast toast--success">
            <div className="toast-title">Sucesso</div>
            <div className="toast-msg">{toast}</div>
            <button className="toast-close" onClick={()=>setToast(null)} aria-label="Fechar">×</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div className="small text-muted">Arrasta para selecionar. Solta para escolher cliente/local/duração.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="chip">Folgas entram no conflito</span>
          <span className="chip">Buffer por local</span>
        </div>
      </div>

      {/* grelha */}
      <div onMouseLeave={()=>dragging && setDragging(false)} onMouseUp={onUp}
        style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }} />
        {days.map((d,i)=>(
          <div key={i} style={{ background: 'var(--card)', borderRight: i<6?'1px solid var(--border)':undefined, padding: 8, fontWeight: 700 }}>
            {d.toLocaleDateString('pt-PT', { weekday:'short', day:'2-digit', month:'2-digit' })}
          </div>
        ))}
        {hours.map((h,r)=>(
          <React.Fragment key={r}>
            <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', paddingInline: 8, display:'flex', alignItems:'center' }}>
              <span className="small text-muted">{fmtHour(h)}</span>
            </div>
            {days.map((_,c)=>{
              const selected = isSelected(c,r);
              return (
                <div key={`${c}-${r}`} onMouseDown={()=>onDown(c,r)} onMouseEnter={()=>onEnter(c,r)}
                  style={{ userSelect:'none', borderTop:'1px solid var(--border)', borderRight: c<6?'1px solid var(--border)':undefined, background: selected?'var(--sidebar-active)':'transparent', minHeight:28, position:'relative', cursor:'crosshair' }}>
                  {sessionsByDay[c]
                    .filter(s => { const sd = new Date(s.start); return sd.getHours()===h.getHours() && Math.abs(sd.getMinutes()-h.getMinutes())<15; })
                    .map(s => {
                      const dur = Math.max(30, Math.round((new Date(s.end).getTime()-new Date(s.start).getTime())/60000));
                      const rows = Math.round(dur/30);
                      return (
                        <div key={s.id} title={`${s.title ?? 'Sessão'} (${fmtHour(new Date(s.start))}–${fmtHour(new Date(s.end))})`}
                          style={{ position:'absolute', left:4, right:4, top:2, height: rows*28-4, borderRadius:10,
                                   background:'color-mix(in oklab, var(--primary) 22%, white)', border:'1px solid var(--primary)', padding:'2px 6px', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {(s.title ?? locations.find(l=>l.id===s.location_id)?.name ?? 'Sessão')}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* modal */}
      {open && range && (
        <div role="dialog" aria-modal="true" aria-label="Nova sessão" onClick={()=>setOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.28)', display:'grid', placeItems:'center', zIndex:1000 }}>
          <div className="card" onClick={(e)=>e.stopPropagation()} style={{ width:'min(560px,92vw)', padding:12 }}>
            <h3 style={{ marginTop:0 }}>Nova sessão</h3>
            <div className="text-muted small" style={{ marginBottom:8 }}>
              {range.start.toLocaleString('pt-PT')} → {addMin(range.start, duration).toLocaleString('pt-PT')}
            </div>
            <div style={{ display:'grid', gap:8 }}>
              <div>
                <label className="small text-muted">Cliente</label>
                <select value={clientId} onChange={(e)=>setClientId(e.target.value)}>
                  <option value="">— escolher —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name ?? c.email}</option>)}
                </select>
              </div>
              <div>
                <label className="small text-muted">Local</label>
                <select value={locationId} onChange={(e)=>setLocationId(e.target.value)}>
                  <option value="">— escolher —</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} {l.travel_min ? `(buffer ~${l.travel_min} min)` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="small text-muted">Duração</label>
                <select value={String(duration)} onChange={(e)=>setDuration(Number(e.target.value))}>
                  {[30,45,60,75,90].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>

              {/* preview conflitos */}
              <ConflictPreview start={range.start} durationMin={duration} locationId={locationId || undefined} checker={checkConflicts} />

              {!!err && <div className="badge-danger" role="alert">{err}</div>}

              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button className="btn chip" onClick={()=>setOpen(false)}>Fechar</button>
                <button className="btn primary" onClick={createSession} disabled={busy}>{busy ? 'A marcar…' : 'Marcar sessão'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConflictPreview({
  start, durationMin, locationId, checker,
}: { start: Date; durationMin: number; locationId?: string; checker:(s:Date,e:Date,loc?:string)=>string[]; }) {
  const end = React.useMemo(()=>addMin(start, durationMin), [start, durationMin]);
  const reasons = React.useMemo(()=>checker(start, end, locationId), [start, end, locationId, checker]);
  if (reasons.length===0) return null;
  return (
    <div className="card" style={{ padding:10, borderColor: 'color-mix(in oklab, var(--danger) 40%, var(--border))' }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>⚠️ Não é possível marcar neste horário:</div>
      <ul style={{ margin:0, paddingInlineStart:16 }}>
        {reasons.map((r,i)=><li key={i} className="small" style={{ color:'var(--muted)' }}>{r}</li>)}
      </ul>
    </div>
  );
}
