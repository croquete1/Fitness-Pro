// src/app/(app)/dashboard/messages/parts/MarkAllRead.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkAllRead() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onClick() {
    try {
      await fetch('/api/messages/mark-all-read', { method: 'POST' });
    } finally {
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="btn"
      data-variant="primary"
      data-size="sm"
      data-loading={pending}
    >
      {pending ? 'A marcar…' : 'Marcar todas como lidas'}
    </button>
  );
}
