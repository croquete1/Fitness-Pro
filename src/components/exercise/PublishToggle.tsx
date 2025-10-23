'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { showToast } from '@/components/ui/Toasts';

export type PublishResult = {
  id: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

type Props = {
  id: string;
  published: boolean;
  onChange?: (result: PublishResult) => void;
};

type PublishResponse = {
  id?: string;
  is_published?: boolean;
  published_at?: string | null;
  updated_at?: string | null;
};

type PublishResponse = {
  is_published?: boolean;
};

export default function PublishToggle({ id, published, onChange }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [current, setCurrent] = React.useState(() => Boolean(published));
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    setCurrent(Boolean(published));
  }, [published]);

  const toggle = React.useCallback(async () => {
    if (busy || !mountedRef.current) return;

    const previous = current;
    const next = !previous;

    setCurrent(next);
    setBusy(true);

    try {
      const response = await fetch(`/api/admin/exercises/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ publish: next }),
      });

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Falha ao sincronizar a publicação.');
      }

      const payload = (await response.json().catch(() => null)) as PublishResponse | null;
      const confirmed = typeof payload?.is_published === 'boolean' ? payload.is_published : next;
      const publishedAt =
        typeof payload?.published_at === 'string'
          ? payload.published_at
          : confirmed
            ? new Date().toISOString()
            : null;
      const updatedAt =
        typeof payload?.updated_at === 'string' ? payload.updated_at : new Date().toISOString();

      if (mountedRef.current) {
        setCurrent(confirmed);
      }

      onChange?.({
        id: payload?.id ?? id,
        isPublished: confirmed,
        publishedAt,
        updatedAt,
      });
      showToast({
        type: 'success',
        title: confirmed ? 'Exercício publicado' : 'Exercício marcado como rascunho',
        description: confirmed
          ? 'O exercício fica visível no catálogo global.'
          : 'O exercício foi removido do catálogo público.',
      });
    } catch (error) {
      if (mountedRef.current) {
        setCurrent(previous);
      }

      const description =
        error instanceof Error && error.message
          ? error.message
          : 'Ocorreu um erro inesperado.';

      showToast({
        type: 'error',
        title: 'Não foi possível actualizar a publicação',
        description,
      });
    } finally {
      if (mountedRef.current) {
        setBusy(false);
      }
    }
  }, [busy, current, id, onChange]);

  const label = current ? 'Publicado' : 'Rascunho';
  const actionLabel = current ? 'Remover exercício do catálogo global' : 'Publicar exercício no catálogo global';

  return (
    <button
      type="button"
      className="neo-toggle-chip publish-toggle"
      data-state={current ? 'on' : 'off'}
      data-loading={busy ? 'true' : 'false'}
      onClick={toggle}
      disabled={busy}
      role="switch"
      aria-checked={current}
      aria-label={actionLabel}
      aria-busy={busy}
      aria-disabled={busy}
    >
      <span className="publish-toggle__content">
        {busy ? <Loader2 aria-hidden className="publish-toggle__spinner neo-spin" /> : null}
        <span>{busy ? 'A guardar…' : label}</span>
      </span>
    </button>
  );
}
