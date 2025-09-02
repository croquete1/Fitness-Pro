'use client';

import * as React from 'react';

export default function CloneButton({ planId, title }: { planId: string; title?: string | null }) {
  const [busy, setBusy] = React.useState(false);

  async function onClone() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/training-plans/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, title: `${title ?? 'Plano'} (cópia)` }),
      });
      if (!res.ok) throw new Error(await res.text());
      // feedback rápido:
      alert('Plano clonado com sucesso.');
      // opcional: window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Falha ao clonar o plano.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn chip" onClick={onClone} disabled={busy}>
      {busy ? 'A clonar…' : 'Clonar'}
    </button>
  );
}