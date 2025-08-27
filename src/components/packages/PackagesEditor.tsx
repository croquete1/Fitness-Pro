// src/components/packages/PackageEditor.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import ToastHost from '@/components/ui/ToastHost';

type Client = { id: string; name: string | null; email: string };
type Pkg = {
  id?: string;
  trainerId?: string;
  clientId?: string;
  planId?: string | null;
  packageName?: string;
  sessionsTotal?: number;
  sessionsUsed?: number;
  priceCents?: number;
  startDate?: string | null;
  endDate?: string | null;
  status?: 'active'|'paused'|'completed'|'cancelled';
  notes?: string;
};

export default function PackageEditor({
  initial, mode='create', onClose, admin=false, trainerIdLocked,
}: {
  initial?: Pkg;
  mode?: 'create' | 'edit';
  onClose?: () => void;
  admin?: boolean;
  trainerIdLocked?: string; // se admin quiser forçar trainer num contexto
}) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastOk, setToastOk] = useState<string>();
  const [toastErr, setToastErr] = useState<string>();

  const [trainerId, setTrainerId] = useState(initial?.trainerId ?? trainerIdLocked ?? '');
  const [clientId,  setClientId]  = useState(initial?.clientId ?? '');
  const [planId,    setPlanId]    = useState(initial?.planId ?? '');
  const [packageName, setPackageName] = useState(initial?.packageName ?? 'Acompanhamento');
  const [sessionsTotal, setSessionsTotal] = useState(initial?.sessionsTotal ?? 0);
  const [sessionsUsed,  setSessionsUsed]  = useState(initial?.sessionsUsed ?? 0);
  const [priceCents,    setPriceCents]    = useState(initial?.priceCents ?? 0);
  const [startDate,     setStartDate]     = useState(initial?.startDate ?? '');
  const [endDate,       setEndDate]       = useState(initial?.endDate ?? '');
  const [status,        setStatus]        = useState<Pkg['status']>(initial?.status ?? 'active');
  const [notes,         setNotes]         = useState(initial?.notes ?? '');

  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => {
    // PT: lista dos seus clientes; Admin pode usar outra UI (não implementada aqui)
    fetch('/api/sb/clients/my').then(r => r.json()).then(j => setClients(j?.data ?? [])).catch(() => setClients([]));
  }, []);

  const canSave = useMemo(() => clientId && packageName && sessionsTotal >= 0, [clientId, packageName, sessionsTotal]);

  async function onSave() {
    setSaving(true); setToastErr(undefined); setToastOk(undefined);
    try {
      const payload: Pkg = {
        trainerId: trainerIdLocked ?? trainerId || undefined,
        clientId,
        planId: planId || null,
        packageName,
        sessionsTotal,
        sessionsUsed,
        priceCents,
        startDate: startDate || null,
        endDate: endDate || null,
        status,
        notes,
      };

      const url = mode === 'edit' && initial?.id ? `/api/sb/packages/${initial.id}` : '/api/sb/packages';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || 'Falha ao guardar');
      setToastOk('Pacote guardado.');
      setTimeout(() => { setOpen(false); onClose?.(); }, 600);
    } catch (e: any) {
      setToastErr(e?.message || 'Erro');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
         onClick={(e) => e.currentTarget === e.target && (onClose?.(), setOpen(false))}>
      <ToastHost success={toastOk} error={toastErr} />
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-4 shadow-xl grid gap-3">
        <h3 className="text-lg font-semibold">{mode === 'edit' ? 'Editar pacote' : 'Novo pacote'}</h3>

        <div className="grid md:grid-cols-2 gap-3">
          {/* Admin pode escolher trainer; PT não precisa (fica lockado pelo server) */}
          {admin && !trainerIdLocked && (
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Trainer ID</span>
              <input className="rounded-lg border p-2" value={trainerId} onChange={e => setTrainerId(e.target.value)} placeholder="uuid do treinador" />
            </label>
          )}

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Cliente</span>
            <select className="rounded-lg border p-2" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Selecionar…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.email} — {c.email}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Nome do pacote</span>
            <input className="rounded-lg border p-2" value={packageName} onChange={e => setPackageName(e.target.value)} placeholder="Acompanhamento Mensal" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Preço (cent)</span>
            <input className="rounded-lg border p-2" type="number" value={priceCents} onChange={(e) => setPriceCents(parseInt(e.target.value || '0', 10))} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Sessões (total)</span>
            <input className="rounded-lg border p-2" type="number" value={sessionsTotal} onChange={(e) => setSessionsTotal(parseInt(e.target.value || '0', 10))} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Sessões (usadas)</span>
            <input className="rounded-lg border p-2" type="number" value={sessionsUsed} onChange={(e) => setSessionsUsed(parseInt(e.target.value || '0', 10))} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Início</span>
            <input className="rounded-lg border p-2" type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Fim</span>
            <input className="rounded-lg border p-2" type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Estado</span>
            <select className="rounded-lg border p-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>

          <label className="grid md:col-span-2 gap-1">
            <span className="text-sm text-gray-600">Notas</span>
            <textarea className="rounded-lg border p-2 min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button className="btn chip" onClick={() => (onClose?.(), setOpen(false))} disabled={saving}>Cancelar</button>
          <button className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
                  onClick={onSave} disabled={!canSave || saving}>
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
