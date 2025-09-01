'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  clientId: string;
  canEdit?: boolean; // ← agora opcional
};

type Num = number | '' | null;

export default function AnthropometryForm({ clientId, canEdit = false }: Props) {
  const router = useRouter();

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [height_cm, setHeight] = useState<Num>('');
  const [weight_kg, setWeight] = useState<Num>('');
  const [body_fat_pct, setBodyFat] = useState<Num>('');
  const [chest_cm, setChest] = useState<Num>('');
  const [waist_cm, setWaist] = useState<Num>('');
  const [hip_cm, setHip] = useState<Num>('');
  const [thigh_cm, setThigh] = useState<Num>('');
  const [arm_cm, setArm] = useState<Num>('');
  const [calf_cm, setCalf] = useState<Num>('');
  const [shoulders_cm, setShoulders] = useState<Num>('');
  const [neck_cm, setNeck] = useState<Num>('');
  const [notes, setNotes] = useState<string>('');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function toNum(n: Num) {
    if (n === '' || n == null) return null;
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
    }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || busy) return;

    setMsg(null);
    setBusy(true);
    try {
      const payload = {
        clientId,
        date,
        height_cm: toNum(height_cm),
        weight_kg: toNum(weight_kg),
        body_fat_pct: toNum(body_fat_pct),
        chest_cm: toNum(chest_cm),
        waist_cm: toNum(waist_cm),
        hip_cm: toNum(hip_cm),
        thigh_cm: toNum(thigh_cm),
        arm_cm: toNum(arm_cm),
        calf_cm: toNum(calf_cm),
        shoulders_cm: toNum(shoulders_cm),
        neck_cm: toNum(neck_cm),
        notes: notes.trim() || null,
      };

      const res = await fetch('/api/anthropometry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || 'Erro ao guardar avaliação');

      setMsg({ kind: 'ok', text: 'Avaliação guardada com sucesso.' });
      // limpa alguns campos rápidos
      setWeight('');
      setWaist('');
      setBodyFat('');
      setNotes('');
      router.refresh(); // atualiza histórico ao lado
    } catch (err: any) {
      setMsg({ kind: 'err', text: err?.message || 'Falha ao guardar avaliação' });
    } finally {
      setBusy(false);
    }
  }

  const disabled = !canEdit || busy;

  return (
    <form onSubmit={onSubmit} className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h3 style={{ margin: 0 }}>Nova avaliação antropométrica</h3>
        <div className="text-xs opacity-70">{canEdit ? 'PT/Admin' : 'Só leitura'}</div>
      </div>

      {msg && (
        <div
          className="rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: msg.kind === 'ok' ? 'var(--ok)' : 'var(--danger)',
            background: msg.kind === 'ok' ? 'rgba(22,163,74,.08)' : 'rgba(239,68,68,.08)',
            color: msg.kind === 'ok' ? 'var(--ok)' : 'var(--danger)',
          }}
        >
          {msg.text}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-5">
        <Field label="Data">
          <input type="date" className="h-10 rounded-lg border px-3"
            style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
            value={date} onChange={(e) => setDate(e.target.value)} disabled={disabled} />
        </Field>

        <Field label="Altura (cm)">
          <NumInput value={height_cm} onChange={setHeight} disabled={disabled} />
        </Field>

        <Field label="Peso (kg)">
          <NumInput value={weight_kg} onChange={setWeight} disabled={disabled} />
        </Field>

        <Field label="Gordura %">
          <NumInput value={body_fat_pct} onChange={setBodyFat} disabled={disabled} />
        </Field>

        <Field label="Cintura (cm)">
          <NumInput value={waist_cm} onChange={setWaist} disabled={disabled} />
        </Field>

        <Field label="Peito (cm)">
          <NumInput value={chest_cm} onChange={setChest} disabled={disabled} />
        </Field>

        <Field label="Anca (cm)">
          <NumInput value={hip_cm} onChange={setHip} disabled={disabled} />
        </Field>

        <Field label="Coxa (cm)">
          <NumInput value={thigh_cm} onChange={setThigh} disabled={disabled} />
        </Field>

        <Field label="Braço (cm)">
          <NumInput value={arm_cm} onChange={setArm} disabled={disabled} />
        </Field>

        <Field label="Panturrilha (cm)">
          <NumInput value={calf_cm} onChange={setCalf} disabled={disabled} />
        </Field>

        <Field label="Ombros (cm)">
          <NumInput value={shoulders_cm} onChange={setShoulders} disabled={disabled} />
        </Field>

        <Field label="Pescoço (cm)">
          <NumInput value={neck_cm} onChange={setNeck} disabled={disabled} />
        </Field>
      </div>

      <div className="grid gap-1">
        <label className="text-xs opacity-70">Notas</label>
        <textarea
          className="min-h-[80px] rounded-lg border px-3 py-2"
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          placeholder="Observações da avaliação (perímetro medido, protocolo, etc.)"
        />
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" className="btn primary" disabled={disabled}>
          {busy ? 'A guardar…' : 'Guardar avaliação'}
        </button>
      </div>
    </form>
  );
}

/* ——— helpers UI ——— */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="opacity-70">{label}</span>
      {children}
    </label>
  );
}

function NumInput({
  value, onChange, disabled,
}: { value: Num; onChange: (v: Num) => void; disabled?: boolean }) {
  return (
    <input
      inputMode="decimal"
      className="h-10 rounded-lg border px-3"
      style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
      value={value === null ? '' : value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '') return onChange('');
        const n = Number(v.replace(',', '.'));
        onChange(Number.isFinite(n) ? n : '');
      }}
      disabled={disabled}
      placeholder="—"
    />
  );
}
