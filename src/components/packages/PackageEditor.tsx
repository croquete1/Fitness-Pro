'use client';

import { useMemo, useState } from 'react';
import { CalendarRange, Layers, PiggyBank, TrendingUp } from 'lucide-react';

export type PackageInitial = Partial<{
  id: string;
  trainerId: string;
  clientId: string;
  planId: string | null;
  packageName: string;
  sessionsPerWeek: number;
  durationWeeks: number;
  priceMonthly: number;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
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
  const [id] = useState(initial.id ?? '');
  const [trainerId, setTrainerId] = useState(initial.trainerId ?? '');
  const [clientId, setClientId] = useState(initial.clientId ?? '');
  const [planId, setPlanId] = useState(initial.planId ?? '');

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

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sessionsTotal = useMemo(() => {
    if (sessionsPerWeek > 0 && durationWeeks > 0) return sessionsPerWeek * durationWeeks;
    return undefined;
  }, [sessionsPerWeek, durationWeeks]);

  const estimatedValue = useMemo(() => {
    if (!sessionsTotal) return 0;
    const weeks = durationWeeks || 0;
    const months = weeks / 4;
    const total = months > 0 ? priceMonthly * months : priceMonthly;
    return Number.isFinite(total) ? total : 0;
  }, [sessionsTotal, priceMonthly, durationWeeks]);

  const usageRate = useMemo(() => {
    const used = Number(initial.sessionsUsed ?? 0);
    if (!sessionsTotal || sessionsTotal === 0) return 0;
    return Math.min(100, Math.round((used / sessionsTotal) * 100));
  }, [initial.sessionsUsed, sessionsTotal]);

  async function save() {
    setSaving(true);
    setErr(null);

    const priceCents = Math.round((Number(priceMonthly) || 0) * 100);

    const payload = {
      trainerId,
      clientId,
      planId: planId || null,
      packageName,
      sessionsPerWeek,
      durationWeeks,
      priceMonthly,
      priceCents,
      sessionsTotal,
      sessionsUsed: Number.isFinite(initial.sessionsUsed ?? NaN) ? initial.sessionsUsed : undefined,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || null,
      notes: notes || null,
    };

    const url = mode === 'edit' && id ? `/api/sb/packages/${id}` : `/api/sb/packages`;
    const method = mode === 'edit' && id ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha ao guardar o pacote');

      onSaved?.(data?.data ?? data);
      onClose?.();
    } catch (error: any) {
      setErr(error?.message || 'Falha ao guardar o pacote');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="neo-panel package-editor" role="form" aria-live="polite">
      <header className="package-editor__header">
        <div>
          <h2 className="package-editor__title">
            {mode === 'edit' ? 'Editar pacote' : 'Novo pacote'}
          </h2>
          <p className="package-editor__subtitle">
            Liga sessões, faturação e progresso numa única experiência `.neo` com dados reais.
          </p>
        </div>
        <ul className="package-editor__metrics" role="list">
          <li>
            <article className="neo-surface" data-variant="primary">
              <span className="neo-surface__label">Sessões previstas</span>
              <span className="neo-surface__value">{sessionsTotal ?? '—'}</span>
              <span className="neo-surface__meta">{sessionsPerWeek}x semana durante {durationWeeks} semanas</span>
            </article>
          </li>
          <li>
            <article className="neo-surface" data-variant="success">
              <span className="neo-surface__label">Valor estimado</span>
              <span className="neo-surface__value">€ {estimatedValue.toFixed(2)}</span>
              <span className="neo-surface__meta">Mensalidade atual × duração</span>
            </article>
          </li>
          <li>
            <article className="neo-surface" data-variant={usageRate >= 80 ? 'warning' : 'neutral'}>
              <span className="neo-surface__label">Utilização</span>
              <span className="neo-surface__value">{usageRate}%</span>
              <span className="neo-surface__meta">Sessões usadas vs. planeadas</span>
            </article>
          </li>
        </ul>
      </header>

      {(admin || mode === 'create') && (
        <div className="package-editor__grid">
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">ID do Personal Trainer</span>
            <input
              className="neo-input"
              value={trainerId}
              onChange={(event) => setTrainerId(event.target.value)}
              placeholder="uuid do Personal Trainer"
            />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Client ID</span>
            <input
              className="neo-input"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="uuid do cliente"
            />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Plan ID (opcional)</span>
            <input
              className="neo-input"
              value={String(planId ?? '')}
              onChange={(event) => setPlanId(event.target.value)}
              placeholder="uuid do plano"
            />
          </label>
        </div>
      )}

      <div className="package-editor__grid">
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Nome do pacote</span>
          <input
            className="neo-input"
            value={packageName}
            onChange={(event) => setPackageName(event.target.value)}
            placeholder="Ex.: Acompanhamento Mensal"
            required
          />
        </label>
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Sessões/semana</span>
          <input
            type="number"
            min={1}
            className="neo-input"
            value={sessionsPerWeek}
            onChange={(event) => setSessionsPerWeek(Number(event.target.value) || 0)}
          />
        </label>
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Duração (semanas)</span>
          <input
            type="number"
            min={1}
            className="neo-input"
            value={durationWeeks}
            onChange={(event) => setDurationWeeks(Number(event.target.value) || 0)}
          />
        </label>
      </div>

      <div className="package-editor__grid">
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Preço/mês (€)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="neo-input"
            value={priceMonthly}
            onChange={(event) => setPriceMonthly(Number(event.target.value) || 0)}
          />
        </label>
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Início</span>
          <input
            type="date"
            className="neo-input"
            value={startDate ?? ''}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Fim (opcional)</span>
          <input
            type="date"
            className="neo-input"
            value={endDate ?? ''}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
      </div>

      <div className="package-editor__grid">
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Estado</span>
          <input
            className="neo-input"
            value={status ?? ''}
            onChange={(event) => setStatus(event.target.value)}
            placeholder="ex.: active, paused…"
          />
        </label>
        <label className="neo-input-group__field package-editor__notes">
          <span className="neo-input-group__label">Notas</span>
          <textarea
            className="neo-input neo-input--textarea"
            rows={3}
            value={notes ?? ''}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Observações, condições, etc."
          />
        </label>
      </div>

      <div className="package-editor__insights">
        <div className="package-editor__insight">
          <PiggyBank className="package-editor__insightIcon" aria-hidden />
          <div>
            <p className="package-editor__insightLabel">Faturação mensal</p>
            <p className="package-editor__insightValue">€ {priceMonthly.toFixed(2)}</p>
          </div>
        </div>
        <div className="package-editor__insight">
          <CalendarRange className="package-editor__insightIcon" aria-hidden />
          <div>
            <p className="package-editor__insightLabel">Duração</p>
            <p className="package-editor__insightValue">{durationWeeks} semanas</p>
          </div>
        </div>
        <div className="package-editor__insight">
          <Layers className="package-editor__insightIcon" aria-hidden />
          <div>
            <p className="package-editor__insightLabel">Sessões totais</p>
            <p className="package-editor__insightValue">{sessionsTotal ?? '—'}</p>
          </div>
        </div>
        <div className="package-editor__insight">
          <TrendingUp className="package-editor__insightIcon" aria-hidden />
          <div>
            <p className="package-editor__insightLabel">Taxa de utilização</p>
            <p className="package-editor__insightValue">{usageRate}%</p>
          </div>
        </div>
      </div>

      {err && (
        <div className="neo-alert" data-tone="danger" role="alert">
          <div className="neo-alert__content">
            <p className="neo-alert__message">{err}</p>
          </div>
        </div>
      )}

      <footer className="package-editor__footer">
        {onClose && (
          <button
            type="button"
            className="neo-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          className="neo-button neo-button--primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'A guardar…' : mode === 'edit' ? 'Guardar alterações' : 'Criar pacote'}
        </button>
      </footer>
    </div>
  );
}
