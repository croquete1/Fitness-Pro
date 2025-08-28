'use client';

import { useState } from 'react';

export type PackageInitial = Partial<{
  id: string;
  trainerId: string;
  clientId: string;
  planId: string | null;

  packageName: string;
  sessionsPerWeek: number;
  durationWeeks: number;
  priceMonthly: number;
  startDate: string;   // ISO date (YYYY-MM-DD)
  notes: string | null;
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
  // IDs (não editáveis visualmente, mas úteis no PATCH)
  const [id] = useState(initial.id ?? '');
  const [trainerId, setTrainerId] = useState(initial.trainerId ?? '');
  const [clientId, setClientId] = useState(initial.clientId ?? '');
  const [planId, setPlanId] = useState(initial.planId ?? '');

  // Campos do pacote
  const [packageName, setPackageName] = useState(initial.packageName ?? '');
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(initial.sessionsPerWeek ?? 1);
  const [durationWeeks, setDurationWeeks] = useState<number>(initial.durationWeeks ?? 4);
  const [priceMonthly, setPriceMonthly] = useState<number>(initial.priceMonthly ?? 0);
  const [startDate, setStartDate] = useState(initial.startDate ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);

    const payload = {
      trainerId,
      clientId,
      planId: planId || null,
      packageName,
      sessionsPerWeek,
      durationWeeks,
      priceMonthly,
      startDate: startDate || null,
      notes: notes || null,
    };

    // Mantive endpoints genéricos — ajusta se os teus forem outros
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
      {/* Só mostra estes selects quando for admin ou no modo create */}
      {(admin || mode === 'create') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Trainer ID</span>
            <input
              className="rounded-lg border p-2"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              placeholder="uuid do treinador"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Client ID</span>
            <input
              className="rounded-lg border p-2"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="uuid do cliente"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Plan ID (opcional)</span>
            <input
              className="rounded-lg border p-2"
              value={String(planId ?? '')}
              onChange={(e) => setPlanId(e.target.value)}
              placeholder="uuid do plano (se existir)"
            />
          </label>
        </div>
      )}

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Nome do pacote</span>
        <input
          className="rounded-lg border p-2"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          placeholder="Ex.: Acompanhamento Mensal"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Sessões/semana</span>
          <input
            type="number"
            min={1}
            className="rounded-lg border p-2"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(Number(e.target.value) || 0)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Duração (semanas)</span>
          <input
            type="number"
            min={1}
            className="rounded-lg border p-2"
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(Number(e.target.value) || 0)}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Preço/mês (€)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="rounded-lg border p-2"
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Data de início</span>
        <input
          type="date"
          className="rounded-lg border p-2"
          value={startDate ?? ''}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Notas</span>
        <textarea
          className="rounded-lg border p-2"
          rows={3}
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações, condições, etc."
        />
      </label>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="mt-2 flex items-center justify-end gap-2">
        {onClose && (
          <button
            className="rounded-lg border px-3 py-2"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
        <button
          className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'A guardar…' : mode === 'edit' ? 'Guardar alterações' : 'Criar pacote'}
        </button>
      </div>
    </div>
  );
}
