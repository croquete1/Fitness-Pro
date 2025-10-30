'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type ClientOption = { id: string; name: string; email?: string | null };

export type PlanInitial = {
  id?: string;
  title?: string;
  status?: PlanStatus;
  clientId?: string | null;
};

const NOTIFY_MAX_CHARS = 500;

export default function PlanForm({
  mode,
  initial,
  clients,
}: {
  mode: 'create' | 'edit';
  initial?: PlanInitial;
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [status, setStatus] = useState<PlanStatus>(initial?.status ?? 'DRAFT');
  const [clientId, setClientId] = useState<string>(initial?.clientId ?? '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notifyClient, setNotifyClient] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');

  const allowNotification = mode === 'edit' && Boolean(clientId);

  const canSubmit = useMemo(() => title.trim().length >= 3, [title]);

  useEffect(() => {
    if (!allowNotification) {
      setNotifyClient(false);
      setNotifyMessage('');
    }
  }, [allowNotification]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setErr(null);

    try {
      const normalizedClientId = clientId === '' ? null : clientId;
      const body = {
        title: title.trim(),
        status,
        clientId: normalizedClientId,
        ...(mode === 'edit'
          ? {
              notifyClient: allowNotification && notifyClient ? true : undefined,
              notifyMessage:
                allowNotification && notifyClient && notifyMessage.trim().length > 0
                  ? notifyMessage.trim()
                  : undefined,
            }
          : {}),
      };
      const url = mode === 'create'
        ? '/api/sb/plans'
        : `/api/sb/plan/${encodeURIComponent(String(initial?.id))}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data: { ok: boolean; id?: string; error?: string } = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Falha ao gravar');

      // redireciona para o detalhe/lista
      router.push('/dashboard/pt/plans');
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro inesperado';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl border bg-white/60 dark:bg-white/5 p-4 md:p-5 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Plano de treino — Hipertrofia"
              className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-black/20"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PlanStatus)}
              className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-black/20"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="ACTIVE">Ativo</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-black/20"
            >
              <option value="">— sem cliente —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.email || c.id}
                </option>
              ))}
            </select>
            <p className="text-xs opacity-70 mt-1">
              Podes criar sem cliente e atribuir mais tarde.
            </p>
          </div>
        </div>

        {mode === 'edit' && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/30 px-4 py-3">
            <label className="flex items-start gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={allowNotification && notifyClient}
                disabled={!allowNotification}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setNotifyClient(checked);
                  if (!checked) setNotifyMessage('');
                }}
                className="mt-1"
              />
              <span>
                Informar o cliente sobre esta alteração
                <span className="block text-xs font-normal opacity-70">
                  Envia uma notificação opcional com as notas que quiseres partilhar.
                </span>
              </span>
            </label>

            {!allowNotification && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                Atribui um cliente ao plano para poderes enviar-lhe uma notificação.
              </p>
            )}

            {allowNotification && notifyClient && (
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1" htmlFor="plan-notify-message">
                  Mensagem para o cliente (opcional)
                </label>
                <textarea
                  id="plan-notify-message"
                  value={notifyMessage}
                  onChange={(event) =>
                    setNotifyMessage(event.target.value.slice(0, NOTIFY_MAX_CHARS))
                  }
                  rows={3}
                  placeholder="Explica brevemente o que foi alterado neste plano."
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/80 dark:bg-black/20"
                />
                <div className="mt-1 flex items-center justify-between text-[11px] uppercase tracking-wide opacity-60">
                  <span>Será anexado à notificação que o cliente recebe.</span>
                  <span>{NOTIFY_MAX_CHARS - notifyMessage.length} restantes</span>
                </div>
              </div>
            )}
          </div>
        )}

        {err && (
          <div className="mt-4 rounded-lg border border-rose-300/40 bg-rose-50/60 dark:bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-200">
            {err}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white px-4 py-2 font-medium"
          >
            {loading ? 'A gravar…' : mode === 'create' ? 'Criar plano' : 'Guardar alterações'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
