// src/app/(app)/dashboard/messages/parts/MarkToggle.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = { id: string; initialRead: boolean };

export default function MarkToggle({ id, initialRead }: Props) {
  const [read, setRead] = useState<boolean>(initialRead);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onToggle() {
    try {
      const next = !read;
      setRead(next); // UI otimista
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, read: next }),
      });
    } catch {
      // reverte se falhar
      setRead((r) => !r);
    } finally {
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className="neo-toggle-chip"
      data-state={read ? 'on' : 'off'}
      data-loading={pending}
      aria-pressed={read}
      title={read ? 'Marcar como não lida' : 'Marcar como lida'}
    >
      {pending ? 'A guardar…' : read ? '✓ Lida' : '• Por ler'}
    </button>
  );
}
