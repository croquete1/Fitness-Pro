'use client';

import * as React from 'react';
import { Paperclip, Image, Loader2, Plus, MessageSquareText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useRealtimeResource } from '@/lib/supabase/useRealtimeResource';
import type {
  ChatAttachment,
  ChatMessage,
  ChatParticipant,
  ChatThread,
  ChatThreadListResponse,
  ChatThreadResponse,
  ChatThreadSummary,
} from '@/lib/messages/chatTypes';

const threadsFetcher = async (): Promise<ChatThreadListResponse> => {
  const response = await fetch('/api/messages/threads', { credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message ?? 'Não foi possível carregar as conversas.');
  }
  return payload as ChatThreadListResponse;
};

type ChatFetchKey = ['messages-chat', 'thread', string] | ['messages-chat', 'counterpart', string];

const chatFetcher = async (key: ChatFetchKey): Promise<ChatThreadResponse> => {
  const [, mode, id] = key;
  const query = mode === 'thread' ? `thread=${encodeURIComponent(id)}` : `counterpart=${encodeURIComponent(id)}`;
  const response = await fetch(`/api/messages/chat?${query}`, { credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message ?? 'Não foi possível carregar a conversa.');
  }
  return payload as ChatThreadResponse;
};

const chatFetcherWrapped = async (key: ChatFetchKey | null): Promise<ChatThreadResponse> => {
  if (!key) {
    throw new Error('CHAT_KEY_MISSING');
  }
  return chatFetcher(key);
};

type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
  isEphemeral: boolean;
  kind: 'image' | 'file';
};

type ChatPanelProps = {
  viewerId: string;
  initialCounterpartId?: string | null;
  initialThreadId?: string | null;
};

const timeFormatter = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' });

function formatTime(value: string | null): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return timeFormatter.format(date);
  } catch {
    return '';
  }
}

function formatDate(value: string | null): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return dayFormatter.format(date);
  } catch {
    return '';
  }
}

function isImageAttachment(attachment: ChatAttachment | PendingAttachment): boolean {
  return attachment.kind === 'image';
}

export default function ChatPanel({ viewerId, initialCounterpartId, initialThreadId }: ChatPanelProps) {
  const {
    data: threadList,
    isLoading: threadsLoading,
    error: threadsError,
    scheduleRealtimeRefresh: scheduleThreadRefresh,
    mutate: mutateThreads,
  } = useRealtimeResource<ChatThreadListResponse, ['messages-threads', string] | null>({
    key: viewerId ? ['messages-threads', viewerId] : null,
    fetcher: () => threadsFetcher(),
    channel: `messages-threads-${viewerId}`,
    subscriptions: [
      { table: 'message_threads', filter: `client_id=eq.${viewerId}` },
      { table: 'message_threads', filter: `trainer_id=eq.${viewerId}` },
      { table: 'messages', filter: `to_id=eq.${viewerId}` },
    ],
    realtimeEnabled: Boolean(viewerId),
  });

  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(initialThreadId ?? null);
  const [activeCounterpartId, setActiveCounterpartId] = React.useState<string | null>(
    initialThreadId ? null : initialCounterpartId ?? null,
  );
  const [composerValue, setComposerValue] = React.useState('');
  const [pendingAttachments, setPendingAttachments] = React.useState<PendingAttachment[]>([]);
  const [composerError, setComposerError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

  const chatKey = React.useMemo<ChatFetchKey | null>(() => {
    if (activeThreadId) return ['messages-chat', 'thread', activeThreadId];
    if (activeCounterpartId) return ['messages-chat', 'counterpart', activeCounterpartId];
    return null;
  }, [activeThreadId, activeCounterpartId]);

  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
    scheduleRealtimeRefresh: scheduleChatRefresh,
    mutate: mutateChat,
  } = useRealtimeResource<ChatThreadResponse, ChatFetchKey | null>({
    key: chatKey,
    fetcher: chatFetcherWrapped,
    channel:
      chatKey && chatKey[1] === 'thread'
        ? `messages-thread-${chatKey[2]}`
        : `messages-thread-${activeCounterpartId ?? 'pending'}`,
    subscriptions:
      chatKey && chatKey[1] === 'thread'
        ? [{ table: 'messages', filter: `thread_id=eq.${chatKey[2]}` }]
        : [],
    realtimeEnabled: Boolean(chatKey && chatKey[1] === 'thread'),
    swr: { revalidateOnFocus: true },
  });

  const initialisedRef = React.useRef(Boolean(initialThreadId || initialCounterpartId));
  React.useEffect(() => {
    if (initialThreadId) {
      setActiveThreadId(initialThreadId);
      setActiveCounterpartId(null);
      initialisedRef.current = true;
      return;
    }
    if (initialCounterpartId) {
      setActiveThreadId(null);
      setActiveCounterpartId(initialCounterpartId);
      initialisedRef.current = true;
    }
  }, [initialCounterpartId, initialThreadId]);
  React.useEffect(() => {
    if (initialisedRef.current) return;
    if (!threadList) return;
    if (threadList.threads.length > 0) {
      const first = threadList.threads[0]!;
      setActiveThreadId(first.id);
      setActiveCounterpartId(first.counterpartId);
      initialisedRef.current = true;
      return;
    }
    const available = threadList.participants.filter((item) => !item.hasThread);
    if (available.length > 0) {
      setActiveThreadId(null);
      setActiveCounterpartId(available[0]!.id);
      initialisedRef.current = true;
    }
  }, [threadList]);

  const activeThread = React.useMemo<ChatThread | null>(() => chatData?.thread ?? null, [chatData]);
  const activeParticipants = React.useMemo<ChatParticipant[]>(() => {
    if (chatData?.participants) return chatData.participants;
    if (threadList?.participants) return threadList.participants;
    return [];
  }, [chatData?.participants, threadList?.participants]);

  const threads = React.useMemo<ChatThreadSummary[]>(() => threadList?.threads ?? [], [threadList?.threads]);
  const availableParticipants = React.useMemo(
    () => activeParticipants.filter((participant) => !participant.hasThread),
    [activeParticipants],
  );

  const selectedParticipant = React.useMemo(() => {
    if (activeThread) {
      return activeParticipants.find((item) => item.id === activeThread.counterpartId) ?? null;
    }
    if (activeCounterpartId) {
      return activeParticipants.find((item) => item.id === activeCounterpartId) ?? null;
    }
    return null;
  }, [activeParticipants, activeThread, activeCounterpartId]);

  const messages = React.useMemo<ChatMessage[]>(() => chatData?.messages ?? [], [chatData?.messages]);

  function resetComposer() {
    setComposerValue('');
    setPendingAttachments((prev) => {
      prev.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }

  function handleSelectThread(thread: ChatThreadSummary) {
    setActiveThreadId(thread.id);
    setActiveCounterpartId(thread.counterpartId);
    initialisedRef.current = true;
  }

  function handleSelectParticipant(participant: ChatParticipant) {
    setActiveThreadId(null);
    setActiveCounterpartId(participant.id);
    initialisedRef.current = true;
  }

  function onAttachmentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const next: PendingAttachment[] = [];
    for (const file of Array.from(files)) {
      const kind = file.type?.startsWith('image/') ? 'image' : 'file';
      const previewUrl = kind === 'image' ? URL.createObjectURL(file) : null;
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl,
        isEphemeral: false,
        kind,
      });
    }

    setPendingAttachments((prev) => [...prev, ...next].slice(0, 5));
    event.target.value = '';
  }

  function toggleAttachmentEphemeral(id: string) {
    setPendingAttachments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (!isImageAttachment(item)) return item;
        return { ...item, isEphemeral: !item.isEphemeral };
      }),
    );
  }

  function removeAttachment(id: string) {
    setPendingAttachments((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

  const disableSend = sending || (!composerValue.trim() && pendingAttachments.length === 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disableSend) return;

    setSending(true);
    setComposerError(null);

    const fd = new FormData();
    if (activeThreadId) fd.append('threadId', activeThreadId);
    if (!activeThreadId && activeCounterpartId) fd.append('counterpartId', activeCounterpartId);
    if (composerValue.trim()) fd.append('body', composerValue.trim());
    pendingAttachments.forEach((attachment) => {
      fd.append('files', attachment.file);
      fd.append('files_is_ephemeral', attachment.isEphemeral ? 'true' : 'false');
    });

    try {
      const response = await fetch('/api/messages/chat', { method: 'POST', body: fd });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        const message = payload?.message ?? 'Não foi possível enviar a mensagem.';
        setComposerError(message);
        return;
      }

      const data = payload as ChatThreadResponse;
      setActiveThreadId(data.thread.id);
      setActiveCounterpartId(data.thread.counterpartId);
      resetComposer();
      mutateChat(data, { revalidate: false });
      await mutateThreads(undefined, { revalidate: true });
      scheduleThreadRefresh();
      scheduleChatRefresh();
    } catch (error) {
      console.error('[messages/chat] falha ao enviar', error);
      setComposerError('Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="messages-dashboard__panel neo-panel messages-chat" aria-label="Chat com o teu PT">
      <div className="messages-chat__sidebar">
        <div className="messages-chat__sidebarHeader">
          <h2 className="messages-chat__title">
            <MessageSquareText aria-hidden /> Conversas
          </h2>
        </div>
        {threadsError ? (
          <Alert tone="danger" title="Não foi possível carregar as conversas" />
        ) : null}
        <div className="messages-chat__list" role="list">
          {threadsLoading && !threads.length ? (
            <div className="messages-chat__empty">A sincronizar…</div>
          ) : null}
          {threads.map((thread) => {
            const isActive = activeThreadId === thread.id;
            return (
              <button
                key={thread.id}
                type="button"
                className={`messages-chat__item${isActive ? ' is-active' : ''}`}
                onClick={() => handleSelectThread(thread)}
              >
                <div className="messages-chat__itemHeader">
                  <span className="messages-chat__itemName">{thread.counterpartName}</span>
                  {thread.lastMessageAt ? (
                    <span className="messages-chat__itemTime">{formatTime(thread.lastMessageAt)}</span>
                  ) : null}
                </div>
                <div className="messages-chat__itemPreview">
                  {thread.lastMessagePreview ? thread.lastMessagePreview : 'Sem mensagens'}
                </div>
                {thread.unreadCount > 0 ? (
                  <span className="messages-chat__unread" aria-label={`${thread.unreadCount} mensagens por ler`}>
                    {thread.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {availableParticipants.length ? (
          <div className="messages-chat__new">
            <h3>Iniciar nova conversa</h3>
            <ul>
              {availableParticipants.map((participant) => (
                <li key={participant.id}>
                  <button type="button" onClick={() => handleSelectParticipant(participant)}>
                    <Plus aria-hidden /> {participant.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="messages-chat__main">
        {selectedParticipant ? (
          <header className="messages-chat__header">
            <div>
              <strong>{selectedParticipant.name}</strong>
              <span>{selectedParticipant.role === 'PT' ? 'Personal Trainer' : 'Cliente'}</span>
            </div>
          </header>
        ) : null}

        {chatError ? (
          <Alert tone="danger" title="Não foi possível carregar a conversa" className="messages-chat__alert" />
        ) : null}

        <div className="messages-chat__messages" aria-live="polite">
          {chatLoading && messages.length === 0 ? (
            <div className="messages-chat__empty">A sincronizar a conversa…</div>
          ) : null}
          {messages.length === 0 && !chatLoading ? (
            <div className="messages-chat__empty">Troca as primeiras mensagens com o teu PT.</div>
          ) : null}
          {messages.map((message) => (
            <article
              key={message.id}
              className="messages-chat__bubble"
              data-direction={message.direction}
            >
              <header>
                <span>{message.direction === 'outbound' ? 'Tu' : selectedParticipant?.name ?? 'PT'}</span>
                {message.sentAt ? <time dateTime={message.sentAt}>{formatDate(message.sentAt)}</time> : null}
              </header>
              {message.body ? <p>{message.body}</p> : null}
              {message.attachments.length ? (
                <ul className="messages-chat__attachments">
                  {message.attachments.map((attachment) => (
                    <li key={attachment.id} className="messages-chat__attachment">
                      <div className="messages-chat__attachmentThumb" data-kind={attachment.kind}>
                        {attachment.kind === 'image' && attachment.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={attachment.url} alt={attachment.name} />
                        ) : (
                          <Paperclip aria-hidden />
                        )}
                      </div>
                      <div className="messages-chat__attachmentBody">
                        <span className="messages-chat__attachmentName">{attachment.name}</span>
                        <div className="messages-chat__attachmentMeta">
                          {attachment.isEphemeral ? <span className="messages-chat__tag">Temporário</span> : null}
                          {attachment.expiresAt ? (
                            <span className="messages-chat__meta">Expira {formatDate(attachment.expiresAt)}</span>
                          ) : null}
                          {attachment.expired ? <span className="messages-chat__meta" data-warning>Expirado</span> : null}
                          {!attachment.expired && attachment.url ? (
                            <a href={attachment.url} target="_blank" rel="noreferrer">
                              Abrir
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <form className="messages-chat__composer" onSubmit={handleSubmit}>
          {composerError ? <Alert tone="danger" title={composerError} /> : null}
          <div className="messages-chat__composerInputs">
            <textarea
              value={composerValue}
              onChange={(event) => setComposerValue(event.target.value)}
              placeholder="Escreve a tua mensagem"
              rows={3}
            />
            <div className="messages-chat__composerActions">
              <label className="messages-chat__attachmentButton">
                <input
                  type="file"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  multiple
                  onChange={onAttachmentChange}
                />
                <Paperclip aria-hidden />
                <span>Anexo</span>
              </label>
              <label className="messages-chat__attachmentButton">
                <input type="file" accept="image/*" multiple onChange={onAttachmentChange} />
                <Image aria-hidden />
                <span>Foto</span>
              </label>
            </div>
          </div>

          {pendingAttachments.length ? (
            <div className="messages-chat__pendingAttachments">
              {pendingAttachments.map((attachment) => (
                <div key={attachment.id} className="messages-chat__pendingItem">
                  <button type="button" onClick={() => removeAttachment(attachment.id)} aria-label="Remover anexo">
                    ×
                  </button>
                  {attachment.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={attachment.previewUrl} alt={attachment.file.name} />
                  ) : (
                    <Paperclip aria-hidden />
                  )}
                  <div>
                    <span>{attachment.file.name}</span>
                    {isImageAttachment(attachment) ? (
                      <label>
                        <input
                          type="checkbox"
                          checked={attachment.isEphemeral}
                          onChange={() => toggleAttachmentEphemeral(attachment.id)}
                        />
                        Temporário
                      </label>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="messages-chat__composerFooter">
            <Button type="submit" variant="primary" disabled={disableSend} leftIcon={sending ? <Loader2 className="icon-spin" /> : <MessageSquareText />}>
              {sending ? 'A enviar…' : 'Enviar'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
