'use client';

import { useState } from 'react';

type PackageEditorProps = {
  /** opcional: id do cliente (se quiseres pré-preencher) */
  clientId?: string;
  /** estado inicial do pacote, para edição */
  initial?: Partial<{
    packageName: string;
    sessionsPerWeek: number;
    durationWeeks: number;
    priceMonthly: number;
    startDate: string; // ISO
    notes: string;
  }>;
  /** se passares um endpoint, o componente faz o fetch POST/PUT por ti */
  saveUrl?: string;
  /** callback manual (se preferires tratar fora) */
  onSubmit?: (data: any) => Promise<void> | void;
  /** render “compacto” em cards/linhas (opcional) */
  dense?: boolean;
} & Record<string, any>;

export default function PackageEditor({
  clientId,
  initial,
  saveUrl,
  onSubmit,
  dense,
  ...rest
}: PackageEditorProps) {
  const [packageName, setPackageName] = useState(initial?.packageName ?? '');
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(initial?.sessionsPerWeek ?? 2);
  const [durationWeeks, setDurationWeeks] = useState<number>(initial?.durationWeeks ?? 4);
  const [priceMonthly, setPriceMonthly] = useState<number>(initial?.priceMonthly ?? 0);
  const [startDate, setStartDate] = useState<string>(initial?.startDate ?? '');
  const [notes, setNotes] = useState<string>(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(false);

    const payload = {
      clientId: clientId ?? null,
      packageName,
      sessionsPerWeek,
      durationWeeks,
      priceMonthly,
      startDate: startDate || null,
      notes: notes || null,
    };

    try {
      if (saveUrl) {
        const res = await fetch(saveUrl, {
          method: initial ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
      } else if (onSubmit) {
        await onSubmit(payload);
      } else {
        // sem destino definido, não falha o build: apenas avisa na consola
        console.warn('[PackageEditor] Nenhum saveUrl/onSubmit fornecido:', payload);
      }
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} {...rest}>
      <div className="grid gap-3" style={{ maxWidth: 720 }}>
        <div className="grid gap-1">
          <label className="text-sm text-gray-600">Nome do pacote</label>
          <input
            className="rounded-lg border p-2"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Ex.: Acompanhamento Mensal"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Sessões/semana</label>
            <input
              className="rounded-lg border p-2"
              type="number"
              min={1}
              max={14}
              value={sessionsPerWeek}
              onChange={(e) => setSessionsPerWeek(parseInt(e.target.value || '0', 10))}
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Duração (semanas)</label>
            <input
              className="rounded-lg border p-2"
              type="number"
              min={1}
              max={52}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value || '0', 10))}
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-gray-600">Preço/mês (€)</label>
            <input
              className="rounded-lg border p-2"
              type="number"
              min={0}
              step="0.01"
              value={priceMonthly}
              onChange={(e) => setPriceMonthly(parseFloat(e.target.value || '0'))}
            />
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-gray-600">Início</label>
          <input
            className="rounded-lg border p-2"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-gray-600">Notas</label>
          <textarea
            className="rounded-lg border p-2"
            rows={dense ? 3 : 5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações do pacote"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {ok && <p className="text-sm text-green-600">Guardado com sucesso.</p>}

        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'A guardar…' : (initial ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </div>
    </form>
  );
}
