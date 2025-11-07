'use client';
import React, { useState, useTransition } from 'react';

type CreatePayload = {
  title: string;
  description?: string | null;
  clientId?: string | null;
  privateNotes?: string | null;
  publicNotes?: string | null;
};

type Props = {
  onCreate: (payload: CreatePayload) => Promise<void>;
  clients?: Array<{ id: string; name: string | null; email: string }>;
};

export default function PlanWizard({ onCreate, clients = [] }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [privateNotes, setPrivateNotes] = useState<string>('');
  const [publicNotes, setPublicNotes] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      await onCreate({
        title: title.trim(),
        description: description.trim() || null,
        clientId: clientId || null,
        privateNotes: privateNotes.trim() ? privateNotes.trim() : null,
        publicNotes: publicNotes.trim() ? publicNotes.trim() : null,
      });
      setTitle('');
      setDesc('');
      setClientId('');
      setPrivateNotes('');
      setPublicNotes('');
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
      <h3 className="font-semibold mb-3">Novo plano</h3>
      <div className="grid gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do plano"
          className="rounded-lg border px-3 py-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
        />
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Descrição (opcional)"
          rows={3}
          className="rounded-lg border px-3 py-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
        />
        <textarea
          value={publicNotes}
          onChange={(e) => setPublicNotes(e.target.value)}
          placeholder="Notas para o cliente (visíveis)"
          rows={3}
          className="rounded-lg border px-3 py-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
        />
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          placeholder="Notas privadas do PT (invisíveis para o cliente)"
          rows={3}
          className="rounded-lg border px-3 py-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
        />
        {clients.length > 0 && (
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border px-3 py-2 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
          >
            <option value="">Atribuir a cliente (opcional)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ?? c.email}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={submit}
          disabled={isPending || !title.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? 'A criar…' : 'Criar plano'}
        </button>
      </div>
    </div>
  );
}
