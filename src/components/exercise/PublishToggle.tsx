'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { showToast } from '@/components/ui/Toasts';

type Props = {
  id: string;
  published: boolean;
  onChange?: (next: boolean) => void;
};

export default function PublishToggle({ id, published, onChange }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [current, setCurrent] = React.useState(!!published);

  React.useEffect(() => {
    if (!busy) {
      setCurrent(!!published);
    }
  }, [busy, published]);

  const toggle = React.useCallback(async () => {
    if (busy) return;

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

      onChange?.(next);
      showToast({
        type: 'success',
        title: next ? 'Exercício publicado' : 'Exercício marcado como rascunho',
        description: next
          ? 'O exercício fica visível no catálogo global.'
          : 'O exercício foi removido do catálogo público.',
      });
    } catch (error) {
      setCurrent(previous);

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
      setBusy(false);
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
    >
      <span className="publish-toggle__content">
        {busy ? <Loader2 aria-hidden className="publish-toggle__spinner neo-spin" /> : null}
        <span>{busy ? 'A guardar…' : label}</span>
      </span>
    </button>
  );
}
