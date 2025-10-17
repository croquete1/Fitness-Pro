// src/app/(app)/dashboard/messages/_components/MessagesFeed.tsx
import type { ReactNode } from 'react';

export type MessageRow = {
  id: string;
  body: string | null;
  sent_at: string | null;
  from_id: string | null;
  to_id: string | null;
};

type MessagesFeedProps = {
  viewerId: string;
  messages: MessageRow[];
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

const messageDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDateTime(value: string | null) {
  if (!value) return '—';
  try {
    return messageDateFormatter.format(new Date(value));
  } catch {
    return '—';
  }
}

type MessageDirection = {
  label: string;
  tone: 'primary' | 'neutral';
  contextLabel: string;
  counterpart: string;
};

function resolveDirection(viewerId: string, message: MessageRow): MessageDirection {
  const from = message.from_id ?? '—';
  const to = message.to_id ?? '—';

  if (message.from_id === viewerId) {
    return {
      label: 'Enviada',
      tone: 'primary',
      contextLabel: 'Para',
      counterpart: to,
    };
  }

  if (message.to_id === viewerId) {
    return {
      label: 'Recebida',
      tone: 'neutral',
      contextLabel: 'De',
      counterpart: from,
    };
  }

  return {
    label: 'Partilhada',
    tone: 'neutral',
    contextLabel: 'Participantes',
    counterpart: `${from} → ${to}`,
  };
}

export default function MessagesFeed({
  viewerId,
  messages,
  emptyIcon = '💬',
  emptyTitle = 'Sem mensagens',
  emptyDescription = 'Assim que trocares mensagens com o teu PT elas aparecem aqui automaticamente.',
}: MessagesFeedProps) {
  if (!messages.length) {
    return (
      <div className="neo-empty">
        <span className="neo-empty__icon" aria-hidden>
          {emptyIcon}
        </span>
        <p className="neo-empty__title">{emptyTitle}</p>
        <p className="neo-empty__description">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ol className="neo-panel__list" aria-live="polite">
      {messages.map((message) => {
        const body = (message.body ?? '').trim();
        const direction = resolveDirection(viewerId, message);
        return (
          <li key={message.id} className="neo-surface space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
              <span className="neo-tag" data-tone={direction.tone}>{direction.label}</span>
              <span>{formatDateTime(message.sent_at)}</span>
            </div>
            <p className="text-sm leading-relaxed text-fg whitespace-pre-wrap break-words">
              {body.length > 0 ? body : '—'}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
              <span>
                {direction.contextLabel}: <strong className="text-fg">{direction.counterpart}</strong>
              </span>
              <span>
                De: <code className="rounded-md bg-[color:color-mix(in_srgb,var(--card-bg)_92%,transparent)] px-2 py-0.5 text-[color:var(--muted-fg)]">{message.from_id ?? '—'}</code>
              </span>
              <span>
                Para: <code className="rounded-md bg-[color:color-mix(in_srgb,var(--card-bg)_92%,transparent)] px-2 py-0.5 text-[color:var(--muted-fg)]">{message.to_id ?? '—'}</code>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
