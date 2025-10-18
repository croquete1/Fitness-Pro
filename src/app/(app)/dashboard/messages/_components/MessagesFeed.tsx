// src/app/(app)/dashboard/messages/_components/MessagesFeed.tsx
import type { ReactNode } from 'react';
import type { MessageListRow } from '@/lib/messages/types';

type MessagesFeedProps = {
  viewerId: string;
  messages: MessageListRow[];
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

const responseDurationFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

function formatDateTime(value: string | null) {
  if (!value) return '—';
  try {
    return messageDateFormatter.format(new Date(value));
  } catch {
    return '—';
  }
}

function formatResponseDuration(minutes: number | null): string {
  if (!Number.isFinite(minutes) || minutes === null) return '';
  const abs = Math.max(0, minutes);
  const hours = Math.floor(abs / 60);
  const mins = Math.round(abs % 60);
  if (hours >= 1) {
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) return `${mins}m`;
  return `${responseDurationFormatter.format(Math.round(abs * 60))}s`;
}

type MessageDirection = {
  label: string;
  tone: 'primary' | 'neutral';
  contextLabel: string;
  counterpart: string;
};

function resolveDirection(viewerId: string, message: MessageListRow): MessageDirection {
  const from = message.fromId ?? '—';
  const to = message.toId ?? '—';

  if (message.direction === 'outbound' || message.fromId === viewerId) {
    return {
      label: 'Enviada',
      tone: 'primary',
      contextLabel: 'Para',
      counterpart: to,
    };
  }

  if (message.direction === 'inbound' || message.toId === viewerId) {
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
    <ol className="messages-feed" aria-live="polite">
      {messages.map((message) => {
        const body = (message.body ?? '').trim();
        const direction = resolveDirection(viewerId, message);
        return (
          <li key={message.id} className="messages-feed__item">
            <div className="messages-feed__meta">
              <span className="messages-feed__direction" data-tone={direction.tone}>
                {direction.label}
              </span>
              <span className="messages-feed__timestamp">{formatDateTime(message.sentAt ?? null)}</span>
              {message.relative ? <span className="messages-feed__relative">{message.relative}</span> : null}
            </div>
            <div className="messages-feed__body">
              <p className="messages-feed__text">{body.length > 0 ? body : '—'}</p>
              <div className="messages-feed__tags">
                <span className="messages-feed__context">
                  {direction.contextLabel}:{' '}
                  <strong>{direction.counterpart}</strong>
                </span>
                {message.channelLabel ? (
                  <span className="messages-feed__channel" data-channel={message.channel}>
                    {message.channelLabel}
                  </span>
                ) : null}
                {message.direction === 'outbound' && message.responseMinutes !== null ? (
                  <span className="messages-feed__response">
                    Tempo de resposta {formatResponseDuration(message.responseMinutes)}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="messages-feed__footer">
              <span>De: <code>{message.fromName ?? message.fromId ?? '—'}</code></span>
              <span>Para: <code>{message.toName ?? message.toId ?? '—'}</code></span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
