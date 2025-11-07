'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

export type NewPlanClientProps = {
  clients: Array<{ id: string; name: string | null; email: string | null }>;
  templates: Array<{
    id: string;
    title: string;
    status: string | null;
    updatedAt: string | null;
    planType: 'template' | 'unassigned' | 'client';
  }>;
};

const STATUS_OPTIONS: Array<{ value: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'; label: string }> = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'ARCHIVED', label: 'Arquivado' },
];

function formatPlanType(type: 'template' | 'unassigned' | 'client') {
  switch (type) {
    case 'template':
      return 'Plano base';
    case 'unassigned':
      return 'Sem cliente';
    default:
      return 'Atribuído';
  }
}

function formatUpdatedAt(value: string | null) {
  if (!value) return 'Sem data';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem data';
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NewPlanClient({ clients, templates }: NewPlanClientProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [privateNotes, setPrivateNotes] = React.useState('');
  const [publicNotes, setPublicNotes] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [status, setStatus] = React.useState<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>('DRAFT');
  const [isTemplate, setIsTemplate] = React.useState(false);
  const [copyFrom, setCopyFrom] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; message: string } | null>(null);

  const hasClients = clients.length > 0;
  const hasTemplates = templates.length > 0;

  const templateOptions = React.useMemo(
    () =>
      templates.map((template) => ({
        value: template.id,
        label: `${formatPlanType(template.planType)} · ${template.title} (${formatUpdatedAt(template.updatedAt)})`,
      })),
    [templates],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ tone: 'danger', message: 'Indica um título para o plano.' });
      return;
    }

    if (!isTemplate && !clientId) {
      setFeedback({ tone: 'danger', message: 'Seleciona um cliente ou marca a opção de plano base/sem cliente.' });
      return;
    }

    try {
      setBusy(true);
      const response = await fetch('/api/pt/training-plans', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          privateNotes: privateNotes.trim() || null,
          publicNotes: publicNotes.trim() || null,
          status,
          clientId: isTemplate ? null : clientId || null,
          isTemplate,
          copyFromPlanId: copyFrom || null,
        }),
      });

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Não foi possível criar o plano.');
      }

      const payload = (await response.json().catch(() => null)) as { id?: string } | null;
      const planId = payload?.id ?? null;

      setFeedback({ tone: 'success', message: 'Plano criado com sucesso!' });
      setTitle('');
      setDescription('');
      setPrivateNotes('');
      setPublicNotes('');
      setClientId('');
      setCopyFrom('');
      setIsTemplate(false);
      setStatus('DRAFT');

      if (planId) {
        router.push(`/dashboard/pt/plans/${planId}`);
      }
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message ?? 'Erro inesperado ao criar o plano.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="neo-panel neo-panel--padded grid gap-6" onSubmit={handleSubmit}>
      <header className="grid gap-1">
        <h1 className="neo-panel__title">Criar plano de treino</h1>
        <p className="neo-panel__subtitle">
          Define um novo plano para um cliente específico, guarda-o como plano base ou duplica uma estrutura existente para
          acelerar a prescrição.
        </p>
      </header>

      {feedback && (
        <Alert tone={feedback.tone} title={feedback.tone === 'success' ? 'Tudo certo' : 'Atenção'}>
          {feedback.message}
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="neo-input-label">Título</span>
          <input
            className="neo-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Hipertrofia · 8 semanas"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="neo-input-label">Estado inicial</span>
          <select className="neo-input" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="neo-input-label">Descrição (opcional)</span>
        <textarea
          className="neo-input"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Notas gerais, objetivos ou contexto do plano."
        />
      </label>

      <label className="grid gap-2">
        <span className="neo-input-label">Notas internas (opcional)</span>
        <textarea
          className="neo-input"
          rows={3}
          value={privateNotes}
          onChange={(event) => setPrivateNotes(event.target.value)}
          placeholder="Informação privada para o treinador."
        />
      </label>

      <label className="grid gap-2">
        <span className="neo-input-label">Notas para o cliente (opcional)</span>
        <textarea
          className="neo-input"
          rows={3}
          value={publicNotes}
          onChange={(event) => setPublicNotes(event.target.value)}
          placeholder="Informação partilhada com o cliente."
        />
      </label>

      <div className="neo-divider" role="separator" />

      <div className="grid gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="neo-checkbox"
            checked={isTemplate}
            onChange={(event) => {
              setIsTemplate(event.target.checked);
              if (event.target.checked) {
                setClientId('');
              }
            }}
          />
          <span>Guardar como plano base (sem cliente atribuído)</span>
        </label>
        <p className="text-xs text-muted">
          Planos base podem ser reutilizados como ponto de partida para novos clientes. Podes duplicá-los mais tarde e ajustar
          os detalhes.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="neo-input-label">Cliente (opcional)</span>
        <select
          className="neo-input"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          disabled={isTemplate || !hasClients}
        >
          <option value="">Sem cliente — atribuir mais tarde</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name ?? client.id}
            </option>
          ))}
        </select>
        {!hasClients && <span className="text-xs text-muted">Sem clientes disponíveis para seleção neste momento.</span>}
      </label>

      <label className="grid gap-2">
        <span className="neo-input-label">Duplicar estrutura existente</span>
        <select className="neo-input" value={copyFrom} onChange={(event) => setCopyFrom(event.target.value)}>
          <option value="">Não copiar — começar do zero</option>
          {templateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasTemplates ? (
          <span className="text-xs text-muted">
            Tens {templates.length} planos guardados. Duplicar um plano base ou um plano existente acelera a personalização.
          </span>
        ) : (
          <span className="text-xs text-muted">Ainda não existem planos guardados para reutilizar.</span>
        )}
      </label>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          Criar plano
        </Button>
      </div>
    </form>
  );
}
