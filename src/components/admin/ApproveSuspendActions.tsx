// src/components/admin/ApproveSuspendActions.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UIButton from '@/components/ui/UIButton';

export default function ApproveSuspendActions({
  userId,
  status,
}: {
  userId: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<'approve' | 'suspend' | null>(null);

  async function patchStatus(newStatus: 'ACTIVE' | 'SUSPENDED') {
    setBusy(newStatus === 'ACTIVE' ? 'approve' : 'suspend');
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Falha ao atualizar estado.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <UIButton
        variant="primary"
        onClick={() => patchStatus('ACTIVE')}
        disabled={busy !== null || status === 'ACTIVE'}
      >
        {busy === 'approve' ? 'A aprovar…' : 'Aprovar'}
      </UIButton>
      <UIButton
        variant="danger"
        onClick={() => patchStatus('SUSPENDED')}
        disabled={busy !== null || status === 'SUSPENDED'}
      >
        {busy === 'suspend' ? 'A suspender…' : 'Suspender'}
      </UIButton>
    </div>
  );
}
