// src/app/(app)/dashboard/pt/sessions/ui/WeekCalendar.tsx
'use client';

import * as React from 'react';

type CalSession = { id: string; start: string; end: string; title?: string; };
type PersonalBlock = { id?: string; start: string; end: string; title?: string };

type Props = {
  weekStartIso: string;
  sessions: CalSession[];
  blocks?: PersonalBlock[];      // indisponibilidades
  bufferMin?: number;            // base
  compact?: boolean;             // agora é usado p/ densidade
  onRequestCreate?: (p: {
    startIso: string; durationMin: number;
    anchor: { x: number; y: number };
  }) => void;
};

const SLOT_MIN = 30;
const DAY_HOURS = { from: 6, to: 22 };

function addMin(d: Date, m: number) { return new Date(d.getTime() + m * 60_000); }
function fmt(t: Date) { return t.toTimeString().slice(0, 5); }

export default function WeekCalendar({
  weekStartIso, sessions, blocks = [], bufferMin = 10, compact = false, onRequestCreate,
}: Props) {
  const weekStart = new Date(weekStartIso);
  const days = [...Array(7)].map((_, i) => addMin(weekStart, i * 1440));
  const rows = (DAY_HOURS.to - DAY_HOURS.from) * (60 / SLOT_MIN);
  const rowH = compact ? 22 : 28;
  const padH = compact ? 4 : 6;

  const [sel, setSel] = React.useState<null | { dayIdx: number; a: number; b: number; anchor: { x: number; y: number } }>(null);

  function slotToDate(dayIdx: number, slot: number) {
    const d = new Date(days[dayIdx]);
    d.setHours(DAY_HOURS.from, 0, 0, 0);
    return addMin(d, slot * SLOT_MIN);
  }

  function begin(dayIdx: number, slot: number, e: React.MouseEvent) {
    setSel({ dayIdx, a: slot, b: slot, anchor: { x: e.clientX, y: e.clientY } });
  }
  function move(slot: number, e: React.MouseEvent) {
    setSel((s) => (s ? { ...s, b: slot } : s));
  }
  function end() {
    if (!sel) return;
    const lo = Math.min(sel.a, sel.b);
    const hi = Math.max(sel.a, sel.b) + 1;
    const start = slotToDate(sel.dayIdx, lo);
    const mins = (hi - lo) * SLOT_MIN;
    setSel(null);
    onRequestCreate?.({ startIso: start.toISOString(), durationMin: mins, anchor: sel.anchor });
  }

  function blocksFor(dayIdx: number) {
    const d0 = slotToDate(dayIdx, 0);
    const d1 = slotToDate(dayIdx, rows);
    return blocks.filter(b => {
      const s = new Date(b.start), e = new Date(b.end);
      return e > d0 && s < d1;
    });
  }

  function blocksRender(dayIdx: number) {
    return blocksFor(dayIdx).map((b, i) => {
      const s = new Date(b.start), e = new Date(b.end);
      const day0 = new Date(days[dayIdx]); day0.setHours(DAY_HOURS.from, 0, 0, 0);
      const topMin = Math.max(0, (s.getTime() - day0.getTime()) / 60_000);
      const durMin = Math.max(0, (e.getTime() - Math.max(s.getTime(), day0.getTime())) / 60_000);
      const top = padH + (topMin / SLOT_MIN) * rowH;
      const h = Math.max(rowH - 2, (durMin / SLOT_MIN) * rowH - 2);

      return (
        <div key={b.id ?? `${i}-${b.start}`}
          title={b.title ?? 'Indisponível'}
          style={{
            position: 'absolute', left: 4, right: 4, top, height: h,
            background: 'repeating-linear-gradient(135deg, #cbd5e1 0 8px, #e2e8f0 8px 16px)',
            border: '1px dashed #94a3b8', borderRadius: 8, opacity: .6, pointerEvents: 'none'
          }}
        />
      );
    });
  }

  function sessionsRender(dayIdx: number) {
    const dStart = slotToDate(dayIdx, 0);
    const dEnd = slotToDate(dayIdx, rows);
    const daySessions = sessions.filter(s => {
      const sStart = new Date(s.start);
      return sStart >= dStart && sStart < dEnd;
    });

    return daySessions.map(s => {
      const sStart = new Date(s.start);
      const sEnd = new Date(s.end);
      const topSlots = Math.max(0, Math.floor((sStart.getHours() - DAY_HOURS.from) * 60 / SLOT_MIN + sStart.getMinutes() / SLOT_MIN));
      const durSlots = Math.max(1, Math.ceil((sEnd.getTime() - sStart.getTime()) / (SLOT_MIN * 60_000)));
      return (
        <div
          key={s.id}
          style={{
            position: 'absolute', left: 6, right: 6, top: padH + topSlots * rowH, height: durSlots * rowH - 2,
            background: 'linear-gradient(180deg, var(--accent), var(--accent-2))', color: '#fff',
            borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,.12)', padding: '6px 8px',
            fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
          title={`${fmt(sStart)}–${fmt(sEnd)} ${s.title ?? ''}`}
        >
          {fmt(sStart)} • {s.title ?? 'Sessão'}
        </div>
      );
    });
  }

  return (
    <div className="card" style={{ padding: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 6 }}>
        <div />
        {days.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontWeight: 700 }}>
            {d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit' })}
          </div>
        ))}

        {[...Array(rows)].map((_, row) => {
          const labelDate = new Date(weekStart);
          labelDate.setHours(DAY_HOURS.from, row * SLOT_MIN, 0, 0);
          const label = fmt(labelDate);

          return (
            <React.Fragment key={row}>
              <div style={{ textAlign: 'right', paddingRight: 6, fontSize: 12, color: 'var(--muted)' }}>{label}</div>
              {days.map((_, dayIdx) => {
                const selecting = sel && sel.dayIdx === dayIdx &&
                  row >= Math.min(sel.a, sel.b) && row <= Math.max(sel.a, sel.b);

                return (
                  <div
                    key={`${dayIdx}-${row}`}
                    onMouseDown={(e) => begin(dayIdx, row, e)}
                    onMouseEnter={(e) => { if (e.buttons === 1) move(row, e); }}
                    onMouseUp={end}
                    style={{
                      position: 'relative', height: rowH, borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: selecting ? 'var(--sidebar-active)' : 'transparent',
                      cursor: 'crosshair',
                    }}
                  >
                    {row === 0 && sessionsRender(dayIdx)}
                    {row === 0 && blocksRender(dayIdx)}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      <div className="small text-muted" style={{ marginTop: 8 }}>
        Arrasta para selecionar um intervalo. Buffer base: {bufferMin} min.
      </div>
    </div>
  );
}
