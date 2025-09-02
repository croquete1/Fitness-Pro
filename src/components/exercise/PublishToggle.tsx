'use client';

import * as React from 'react';

type Props = {
  id: string;
  published: boolean;
  // callback opcional para atualizar lista/estado do pai
  onChange?: (next: boolean) => void;
};

export default function PublishToggle({ id, published, onChange }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [isOn, setIsOn] = React.useState(!!published);

  async function toggle() {
    try {
      setBusy(true);
      const path = isOn
        ? `/api/admin/exercises/${id}/unpublish`
        : `/api/admin/exercises/${id}/publish`;
      const res = await fetch(path, { method: 'PATCH' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIsOn(!isOn);
      onChange?.(!isOn);
    } catch (e) {
      console.error('publish toggle', e);
      alert('Falha ao alterar publicação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="btn chip"
      aria-pressed={isOn}
      title={isOn ? 'Remover do catálogo' : 'Publicar no catálogo'}
      style={{
        display: 'inline-flex',
        gap: 8,
        alignItems: 'center',
        opacity: busy ? 0.6 : 1,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: isOn ? '#10b981' : '#9ca3af', // verde / cinza
          boxShadow: '0 0 0 3px rgba(16,185,129,0.15)',
        }}
        aria-hidden
      />
      {isOn ? 'Publicado' : 'Não publicado'}
    </button>
  );
}