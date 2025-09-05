// src/app/(app)/dashboard/pt/sessions/ui/WeekCalendar.tsx
'use client';

import * as React from 'react';

type CalSession = {
  id: string;
  start: string;  // ISO
  end: string;    // ISO
  title?: string;
};

type Props = {
  weekStartIso: string;              // ISO da 2ªf 00:00
  sessions: CalSession[];
  bufferMin?: number;                // default 10
  compact?: boolean;                 // true para mini-grelha
  onCreated?: (s: { start: string; durationMin: number }) => void; // callback pós-criação
};

const PAD_H = 6;
const SLOT_MIN = 30; // grelha de 30m
const DAY_HOURS = { from: 6, to: 22 }; // 06:00-22:00

function addMin(d: Date, m: number) { return new Date(d.getTime() + m * 60_000); }
function fmt(t: Date) { return t.toTimeString().slice(0,5); }

export default function WeekCalendar({ weekStartIso, sessions, bufferMin = 10, compact, onCreated }: Props) {
  const weekStart = new Date(weekStartIso);
  const days = [...Array(7)].map((_, i) => addMin(weekStart, i * 24 * 60));
  const hours = [...Array((DAY_HOURS.to - DAY_HOURS.from) * (60 / SLOT_MIN))].map((_, i) => i);

  // seleção
  const [sel, setSel] = React.useState<null | { dayIdx: number; startSlot: number; endSlot: number }>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  function slotToDate(dayIdx: number, slot: number) {
    const d = new Date(days[dayIdx]);
    d.setHours(DAY_HOURS.from, 0, 0, 0);
    return addMin(d, slot * SLOT_MIN);
  }

  function beginSelect(dayIdx: number, slot: number) {
    setSel({ dayIdx, startSlot: slot, endSlot: slot });
  }
  function moveSelect(slot: number) {
    setSel((s) => (s ? { ...s, endSlot: slot } : s));
  }
  async function endSelect() {
    if (!sel) return;
    const a = Math.min(sel.startSlot, sel.endSlot);
    const b = Math.max(sel.startSlot, sel.endSlot) + 1; // inclusivo
    const start = slotToDate(sel.dayIdx, a);
    const mins = (b - a) * SLOT_MIN;

    setSel(null);

    // verificar no servidor (inclui buffer)
    const url = `/api/pt/sessions/check?start=${encodeURIComponent(start.toISOString())}&dur=${mins}&buffer=${bufferMin}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) { alert('Erro a validar horário.'); return; }
    const data = await res.json();
    if (data?.conflict) {
      const msg = data.conflicts?.[0]?.type === 'buffer'
        ? `Respeita o intervalo de ${data.bufferMin} minutos entre sessões.`
        : 'Já tens uma sessão neste intervalo.';
      alert(msg);
      return;
    }

    // confirmar criação
    const ok = confirm(`Criar sessão às ${fmt(start)} com duração de ${mins} minutos?`);
    if (!ok) return;

    const resp = await fetch('/api/pt/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_id: '', start: start.toISOString(), duration_min: mins, buffer_min: bufferMin }),
    });
    if (resp.status === 400) { alert('Escolhe um cliente na página de criação.'); return; }
    if (resp.status === 409) { alert(await resp.text()); return; }
    if (!resp.ok) { alert('Erro ao criar sessão.'); return; }

    onCreated?.({ start: start.toISOString(), durationMin: mins });
  }

  // pintar sessões existentes
  function renderBlocks(dayIdx: number) {
    const dStart = slotToDate(dayIdx, 0);
    const dEnd = slotToDate(dayIdx, hours.length);
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
            position: 'absolute',
            left: 6, right: 6,
            top: PAD_H + topSlots * 28,
            height: durSlots * 28 - 2,
            background: 'linear-gradient(180deg, var(--accent), var(--accent-2))',
            color: '#fff',
            borderRadius: 10,
            boxShadow: '0 6px 16px rgba(0,0,0,.12)',
            padding: '6px 8px',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={`${fmt(sStart)}–${fmt(sEnd)} ${s.title ?? ''}`}
        >
          {fmt(sStart)} • {s.title ?? 'Sessão'}
        </div>
      );
    });
  }

  return (
    <div ref={rootRef} className="card" style={{ padding: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 6 }}>
        {/* cabeçalho dos dias */}
        <div />
        {days.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontWeight: 700 }}>
            {d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit' })}
          </div>
        ))}

        {/* grelha */}
        {hours.map((hIdx) => {
          const slotTime = new Date(weekStart);
          slotTime.setHours(DAY_HOURS.from, hIdx * SLOT_MIN, 0, 0);
          const label = fmt(slotTime);
          return (
            <React.Fragment key={hIdx}>
              <div style={{ textAlign: 'right', paddingRight: 6, fontSize: 12, color: 'var(--muted)' }}>{label}</div>

              {days.map((_, dayIdx) => {
                const slotIndex = hIdx;
                const selecting = sel && sel.dayIdx === dayIdx &&
                  slotIndex >= Math.min(sel.startSlot, sel.endSlot) &&
                  slotIndex <= Math.max(sel.startSlot, sel.endSlot);

                return (
                  <div
                    key={`${dayIdx}-${hIdx}`}
                    onMouseDown={() => beginSelect(dayIdx, slotIndex)}
                    onMouseEnter={(e) => { if (e.buttons === 1) moveSelect(slotIndex); }}
                    onMouseUp={endSelect}
                    style={{
                      position: 'relative',
                      height: 28,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: selecting ? 'var(--sidebar-active)' : 'transparent',
                      cursor: 'crosshair',
                    }}
                  >
                    {/* blocos do dia (apenas 1x por slot 0 para performance) */}
                    {hIdx === 0 && renderBlocks(dayIdx)}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      <div className="small text-muted" style={{ marginTop: 8 }}>
        Dica: arrasta para selecionar um intervalo. Buffer mínimo: {bufferMin} min.
      </div>
    </div>
  );
}
