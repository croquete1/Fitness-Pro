// src/components/client/AnthropometryForm.tsx
'use client';

import { useState } from 'react';

// Notas de UX: sem dependências de toast para não quebrar build.
// Fazemos dispatch de um CustomEvent('app:toast') se o teu provider estiver a escutar.
// Caso não exista provider, usamos alert() como fallback.
function notify(kind: 'success' | 'error' | 'info', message: string) {
  try {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { kind, message } }));
  } catch {}
  if (kind !== 'success') alert(message);
}

type Props = {
  clientId: string;
  canEdit: boolean; // PT/Admin
};

export default function AnthropometryForm({ clientId, canEdit }: Props) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [height_cm, setHeight] = useState<string>('');
  const [weight_kg, setWeight] = useState<string>('');
  const [body_fat_pct, setBf] = useState<string>('');
  const [chest_cm, setChest] = useState<string>('');
  const [waist_cm, setWaist] = useState<string>('');
  const [hip_cm, setHip] = useState<string>('');
  const [thigh_cm, setThigh] = useState<string>('');
  const [arm_cm, setArm] = useState<string>('');
  const [calf_cm, setCalf] = useState<string>('');
  const [shoulders_cm, setShoulders] = useState<string>('');
  const [neck_cm, setNeck] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setBusy(true);
    try {
      const res = await fetch('/api/anthropometry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          date,
          height_cm, weight_kg, body_fat_pct,
          chest_cm, waist_cm, hip_cm, thigh_cm,
          arm_cm, calf_cm, shoulders_cm, neck_cm,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erro ao gravar avaliação.');

      notify('success', 'Avaliação gravada com sucesso!');
      // Limpa apenas campos “rápidos”
      setNotes('');
    } catch (err: any) {
      notify('error', err?.message ?? 'Erro ao gravar avaliação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h3 style={{ margin: 0 }}>Nova avaliação antropométrica</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-lg border px-2"
          style={{ borderColor: 'var(--border)', background: 'var(--btn-bg)' }}
          disabled={!canEdit}
        />
      </div>

      <div className="grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <Field label="Altura (cm)" value={height_cm} setValue={setHeight} disabled={!canEdit} />
        <Field label="Peso (kg)" value={weight_kg} setValue={setWeight} disabled={!canEdit} />
        <Field label="Gordura (%)" value={body_fat_pct} setValue={setBf} disabled={!canEdit} />
        <Field label="Peito (cm)" value={chest_cm} setValue={setChest} disabled={!canEdit} />
        <Field label="Cintura (cm)" value={waist_cm} setValue={setWaist} disabled={!canEdit} />
        <Field label="Anca (cm)" value={hip_cm} setValue={setHip} disabled={!canEdit} />
        <Field label="Coxa (cm)" value={thigh_cm} setValue={setThigh} disabled={!canEdit} />
        <Field label="Braço (cm)" value={arm_cm} setValue={setArm} disabled={!canEdit} />
        <Field label="Panturrilha (cm)" value={calf_cm} setValue={setCalf} disabled={!canEdit} />
        <Field label="Ombros (cm)" value={shoulders_cm} setValue={setShoulders} disabled={!canEdit} />
        <Field label="Pescoço (cm)" value={neck_cm} setValue={setNeck} disabled={!canEdit} />
      </div>

      <div className="grid gap-1">
        <label className="text-xs opacity-70">Notas</label>
        <textarea
          className="min-h-[80px] rounded-lg border px-3 py-2"
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
          placeholder="Observações da avaliação física…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
        />
      </div>

      <div className="flex justify-end">
        <button className="btn primary" type="submit" disabled={!canEdit || busy}>
          {busy ? 'A guardar…' : 'Guardar avaliação'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label, value, setValue, disabled,
}: { label: string; value: string; setValue: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="opacity-70">{label}</span>
      <input
        inputMode="decimal"
        className="h-9 rounded-lg border px-2"
        style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
    </label>
  );
}
