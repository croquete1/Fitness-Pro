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
      onClick={onToggle}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border transition
        ${read
          ? 'border-slate-300/70 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
          : 'border-emerald-300/60 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/70 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'}`}
      aria-pressed={read}
      title={read ? 'Marcar como não lida' : 'Marcar como lida'}
    >
      {pending ? 'A guardar…' : read ? '✓ Lida' : '• Por ler'}
    </button>
  );
}
