'use client';

import * as React from 'react';

type Props = {
  id: string;
  published: boolean;
  onChange?: (next: boolean) => void;
};

export default function PublishToggle({ id, published, onChange }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [isOn, setIsOn] = React.useState(!!published);

  React.useEffect(() => {
    setIsOn(!!published);
  }, [published]);

  async function toggle() {
    try {
      setBusy(true);
      const res = await fetch(`/api/admin/exercises/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: !isOn }),
      });
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
        background: isOn
          ? 'var(--badge-status-active-bg, rgba(16,185,129,0.12))'
          : 'var(--badge-status-draft-bg, rgba(156,163,175,0.12))',
        color: isOn
          ? 'var(--badge-status-active-fg, #166534)'
          : 'var(--badge-status-draft-fg, #374151)',
        borderColor: isOn
          ? 'var(--badge-status-active-border, rgba(16,185,129,0.2))'
          : 'var(--badge-status-draft-border, rgba(156,163,175,0.2))',
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: isOn
            ? 'var(--badge-status-active-border, rgba(16,185,129,0.2))'
            : 'var(--badge-status-draft-border, rgba(156,163,175,0.2))',
          boxShadow: isOn
            ? '0 0 0 3px var(--badge-status-active-border, rgba(16,185,129,0.2))'
            : '0 0 0 3px var(--badge-status-draft-border, rgba(156,163,175,0.2))',
        }}
        aria-hidden
      />
      {isOn ? 'Publicado' : 'Não publicado'}
    </button>
  );
}
