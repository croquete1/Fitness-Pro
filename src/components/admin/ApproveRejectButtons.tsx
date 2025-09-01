// src/components/admin/ApproveRejectButtons.tsx
'use client';

import { useState, useTransition } from 'react';
import { useToast } from '@/components/ui/Toasts';

type Busy = 'approve' | 'reject' | null;

export default function ApproveRejectButtons({ userId }: { userId: string }) {
  // API nova: o hook devolve { push({ kind:'success'|'error'|'info', message }) }
  const { push } = (useToast?.() ?? { push: (_: any) => {} });
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<Busy>(null);

  function notify(kind: 'success' | 'error', message: string) {
    try {
      push({ kind, message });
    } catch {
      // silencioso (caso o provider não esteja montado por algum motivo)
    }
  }

  async function doAction(action: 'approve' | 'reject') {
    setBusy(action);
    start(async () => {
      try {
        const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || 'Falha no pedido');
        }
        notify('success', action === 'approve' ? 'Conta aprovada' : 'Conta rejeitada');
      } catch (err: any) {
        notify('error', err?.message || 'Ocorreu um erro');
      } finally {
        setBusy(null);
      }
    });
  }

  const disabled = pending || busy !== null;

  return (
    <div className="inline-flex gap-2">
      <button
        type="button"
        className="btn success"
        disabled={disabled}
        onClick={() => doAction('approve')}
        aria-busy={busy === 'approve' || undefined}
        title="Aprovar conta"
      >
        {busy === 'approve' ? 'A aprovar…' : 'Aprovar'}
      </button>

      <button
        type="button"
        className="btn danger"
        disabled={disabled}
        onClick={() => doAction('reject')}
        aria-busy={busy === 'reject' || undefined}
        title="Rejeitar conta"
      >
        {busy === 'reject' ? 'A rejeitar…' : 'Rejeitar'}
      </button>
    </div>
  );
}
