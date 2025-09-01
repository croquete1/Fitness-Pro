// src/components/wallet/WalletControls.tsx
'use client';

import { useState } from 'react';

export default function WalletControls({
  onCreate,
}: {
  onCreate?: (draft: {
    packageName: string;
    sessionsPerWeek: number;
    durationWeeks: number;
    pricePerMonth: number;
    status: string;
    start?: string;
    end?: string;
    notes?: string;
  }) => void;
}) {
  const [packageName, setPackageName] = useState('');
  const [sessionsPerWeek, setSPW] = useState(1);
  const [durationWeeks, setDW] = useState(4);
  const [pricePerMonth, setPPM] = useState(0);
  const [status, setStatus] = useState<'active' | 'paused' | 'archived'>('active');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="card" style={{ padding: 12, display:'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h2 style={{ margin: 0 }}>Minha carteira</h2>
        <div className="flex gap-6 text-xs">
          <span className="chip">Sessões/sem.</span>
          <Stepper value={sessionsPerWeek} onChange={setSPW} min={1} max={14} />
          <span className="chip">Duração (semanas)</span>
          <Stepper value={durationWeeks} onChange={setDW} min={1} max={52} />
          <span className="chip">Preço/mês (€)</span>
          <Stepper value={pricePerMonth} onChange={setPPM} min={0} step={5} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <input
          className="h-10 rounded-lg border px-3"
          placeholder="Nome do pacote (ex.: Acompanhamento Mensal)"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
        />
        <select
          className="h-10 rounded-lg border px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
        >
          <option value="active">Ativo</option>
          <option value="paused">Pausado</option>
          <option value="archived">Arquivado</option>
        </select>
        <div className="flex gap-3">
          <input className="h-10 rounded-lg border px-3 flex-1" placeholder="Início (aaaa-mm-dd)" value={start} onChange={e=>setStart(e.target.value)} style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }} />
          <input className="h-10 rounded-lg border px-3 flex-1" placeholder="Fim (opcional)" value={end} onChange={e=>setEnd(e.target.value)} style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }} />
        </div>
      </div>

      <textarea
        className="min-h-[80px] rounded-lg border px-3 py-2"
        placeholder="Notas (observações, condições, etc.)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
      />

      <div className="flex justify-end">
        <button
          className="btn primary"
          onClick={() => onCreate?.({ packageName, sessionsPerWeek, durationWeeks, pricePerMonth, status, start, end, notes })}
          disabled={!packageName.trim()}
          title={packageName.trim() ? 'Criar pacote' : 'Define um nome para o pacote'}
        >
          Criar pacote
        </button>
      </div>
    </div>
  );
}

function Stepper({
  value, onChange, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, step = 1,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="flex items-center gap-1">
      <button className="btn icon" onClick={() => onChange(Math.max(min, value - step))} type="button">–</button>
      <div className="w-10 text-center">{value}</div>
      <button className="btn icon" onClick={() => onChange(Math.min(max, value + step))} type="button">+</button>
    </div>
  );
}