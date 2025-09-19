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
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-semibold shadow hover:bg-indigo-500 disabled:opacity-60"
    >
      {pending ? 'A marcar…' : 'Marcar todas como lidas'}
    </button>
  );
}
