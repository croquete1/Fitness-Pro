// src/components/packages/PackageEditor.tsx
'use client';

import { useMemo, useState } from 'react';

export type PackageInitial = Partial<{
  id: string;
  trainerId: string;
  clientId: string;
  planId: string | null;

  // Base
  packageName: string;
  sessionsPerWeek: number;
  durationWeeks: number;
  priceMonthly: number; // €
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD (opcional)
  status: string;        // livre (mantemos compat)
  notes: string | null;

  // Extras/compat
  sessionsTotal: number;
  sessionsUsed: number;
  priceCents: number;
}>;

type PackageEditorProps = {
  admin?: boolean;
  mode?: 'create' | 'edit';
  initial?: PackageInitial;
  onClose?: () => void;
  onSaved?: (pkg: any) => void;
};

export default function PackageEditor({
  admin = false,
  mode = 'create',
  initial = {},
  onClose,
  onSaved,
}: PackageEditorProps) {
  // IDs (não expostos ao utilizador, salvo caso admin criar)
  const [id] = useState(initial.id ?? '');
  const [trainerId, setTrainerId] = useState(initial.trainerId ?? '');
  const [clientId, setClientId] = useState(initial.clientId ?? '');
  const [planId, setPlanId] = useState(initial.planId ?? '');

  // Campos do pacote
  const [packageName, setPackageName] = useState(initial.packageName ?? '');

  const inferredSPW = useMemo(() => {
    if (initial.sessionsPerWeek != null) return initial.sessionsPerWeek;
    if (initial.sessionsTotal != null && initial.durationWeeks) {
      const v = Math.round(initial.sessionsTotal / initial.durationWeeks);
      return Number.isFinite(v) && v > 0 ? v : 1;
    }
    return 1;
  }, [initial.sessionsPerWeek, initial.sessionsTotal, initial.durationWeeks]);

  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(inferredSPW);
  const [durationWeeks, setDurationWeeks] = useState<number>(initial.durationWeeks ?? 4);

  const initialMonthly = useMemo(() => {
    if (initial.priceMonthly != null) return initial.priceMonthly;
    if (initial.priceCents != null) return Math.round(initial.priceCents) / 100;
    return 0;
  }, [initial.priceMonthly, initial.priceCents]);

  const [priceMonthly, setPriceMonthly] = useState<number>(initialMonthly);
  const [startDate, setStartDate] = useState(initial.startDate ?? '');
  const [endDate, setEndDate] = useState(initial.endDate ?? '');
  const [status, setStatus] = useState(initial.status ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');

  const [sessionsUsed] = useState<number>(initial.sessionsUsed ?? 0);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);

    const sessionsTotal =
      sessionsPerWeek > 0 && durationWeeks > 0
        ? sessionsPerWeek * durationWeeks
        : undefined;

    const priceCents = Math.round((Number(priceMonthly) || 0) * 100);

    const payload = {
      trainerId,
      clientId,
      planId: planId || null,
      packageName,
      sessionsPerWeek,
      durationWeeks,
      // enviamos os dois para o backend poder aceitar qualquer um
      priceMonthly,
      priceCents,
      sessionsTotal,
      sessionsUsed: Number.isFinite(sessionsUsed) ? sessionsUsed : undefined,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || null,
      notes: notes || null,
    };

    const url =
      mode === 'edit' && id ? `/api/sb/packages/${id}` : `/api/sb/packages`;
    const method = mode === 'edit' && id ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const j = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setErr(j?.error || 'Falha ao guardar o pacote');
      return;
    }

    onSaved?.(j?.data ?? j);
    onClose?.();
  }

  return (
    <div className="grid gap-3">
      {(admin || mode === 'create') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-muted">ID do Personal Trainer</span>
            <input
              className="neo-field"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              placeholder="uuid do Personal Trainer"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-muted">Client ID</span>
            <input
              className="neo-field"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="uuid do cliente"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-muted">Plan ID (opcional)</span>
            <input
              className="neo-field"
              value={String(planId ?? '')}
              onChange={(e) => setPlanId(e.target.value)}
              placeholder="uuid do plano"
            />
          </label>
        </div>
      )}

      <label className="grid gap-1">
        <span className="text-sm text-muted">Nome do pacote</span>
        <input
          className="neo-field"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          placeholder="Ex.: Acompanhamento Mensal"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-muted">Sessões/semana</span>
          <input
            type="number"
            min={1}
            className="neo-field"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(Number(e.target.value) || 0)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted">Duração (semanas)</span>
          <input
            type="number"
            min={1}
            className="neo-field"
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(Number(e.target.value) || 0)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted">Preço/mês (€)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="neo-field"
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-muted">Início</span>
          <input
            type="date"
            className="neo-field"
            value={startDate ?? ''}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted">Fim (opcional)</span>
          <input
            type="date"
            className="neo-field"
            value={endDate ?? ''}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted">Estado (texto)</span>
          <input
            className="neo-field"
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="ex.: active, paused…"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-muted">Notas</span>
        <textarea
          className="neo-field"
          rows={3}
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações, condições, etc."
        />
      </label>

      {err && <p className="text-sm text-danger">{err}</p>}

      <div className="mt-2 flex items-center justify-end gap-2">
        {onClose && (
          <button className="btn ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
        )}
        <button
          className="btn primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'A guardar…' : mode === 'edit' ? 'Guardar alterações' : 'Criar pacote'}
        </button>
      </div>
    </div>
  );
}
