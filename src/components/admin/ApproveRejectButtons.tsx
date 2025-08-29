'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function ApproveRejectButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  async function action(op: 'approve' | 'reject') {
    setLoading(op);
    try {
      const res = await fetch(`/api/admin/approvals/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ op }).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));

      // Undo = operação contrária
      const undoOp = op === 'approve' ? 'reject' : 'approve';
      push({
        message: op === 'approve' ? 'Conta aprovada.' : 'Pedido rejeitado.',
        actionLabel: 'Desfazer',
        onAction: async () => {
          await fetch(`/api/admin/approvals/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ op: undoOp }).toString(),
          });
          router.refresh();
        },
      });
      router.refresh();
    } catch {
      push({ message: 'Não foi possível concluir a ação.' });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="table-actions">
      <button className="btn chip" disabled={loading !== null} onClick={()=>action('approve')}>
        {loading === 'approve' ? 'A aprovar…' : 'Aprovar'}
      </button>
      <button className="btn chip" disabled={loading !== null} onClick={()=>action('reject')}>
        {loading === 'reject' ? 'A rejeitar…' : 'Rejeitar'}
      </button>
    </div>
  );
}
