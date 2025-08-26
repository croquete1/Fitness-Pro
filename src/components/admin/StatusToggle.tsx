'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type Status = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export default function StatusToggle({
  user,
}: {
  user: { id: string; status: Status };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next =
    user.status === 'ACTIVE'
      ? ('SUSPENDED' as Status)
      : ('ACTIVE' as Status);

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

  const label = user.status === 'ACTIVE' ? 'Suspender' : 'Ativar';

  return (
    <button
      onClick={onToggle}
      disabled={isPending}
      title={label}
      style={{
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--btn-bg)',
        cursor: isPending ? 'default' : 'pointer',
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? '...' : label}
    </button>
  );
}
