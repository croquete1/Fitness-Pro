'use client';

import { useState, useTransition } from 'react';
import { useToast } from '@/components/ui/Toasts';

export default function ApproveRejectButtons({ userId }: { userId: string }) {
  const { success, error } = useToast();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  async function act(op: 'approve' | 'reject') {
    setBusy(op);
    try {
      const res = await fetch(`/api/admin/approvals/${userId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ op }),
      });
      if (!res.ok) throw new Error(await res.text());
      success(op === 'approve' ? 'Conta aprovada com sucesso.' : 'Pedido rejeitado.');
      start(() => {
        // Refaz o route segment (rsc revalidate)
        if (typeof window !== 'undefined') location.reload();
      });
    } catch (e: any) {
      error(e?.message || 'Falha ao atualizar aprovação.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="table-actions">
      <button className="btn chip" disabled={pending || busy === 'approve'} onClick={() => act('approve')}>
        {busy === 'approve' ? 'A aprovar…' : 'Aprovar'}
      </button>
      <button className="btn chip" disabled={pending || busy === 'reject'} onClick={() => act('reject')}>
        {busy === 'reject' ? 'A rejeitar…' : 'Rejeitar'}
      </button>
    </div>
  );
}
