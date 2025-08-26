// src/components/admin/StatusToggle.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type Status = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export default function StatusToggle({ user }: { user: { id: string; status: Status } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next = user.status === 'ACTIVE' ? ('SUSPENDED' as Status) : ('ACTIVE' as Status);
  const label = user.status === 'ACTIVE' ? 'Suspender' : 'Ativar';

  async function onToggle() {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Erro ao atualizar o estado');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={onToggle}
      disabled={isPending}
      className="btn"
      style={{
        height: 32,
        lineHeight: '20px',
        padding: '6px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {isPending ? '...' : label}
    </button>
  );
}
