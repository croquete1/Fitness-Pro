// src/app/(app)/dashboard/messages/parts/MarkAllRead.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
import Button, { type ButtonProps } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Props = {
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
};

export default function MarkAllRead({ size = 'sm', variant = 'secondary', className }: Props) {
  const [isRefreshing, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function onClick() {
    if (submitting || isRefreshing) return;
    try {
      setSubmitting(true);
      const response = await fetch('/api/messages/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Não foi possível marcar as mensagens como lidas.');
      }
      toast.success('Todas as mensagens foram marcadas como lidas.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível marcar como lidas.';
      toast.error(message);
    } finally {
      setSubmitting(false);
      startTransition(() => router.refresh());
    }
  }

  const busy = submitting || isRefreshing;

  return (
    <Button
      type="button"
      onClick={onClick}
      loading={busy}
      size={size}
      variant={variant}
      className={className}
      leftIcon={<CheckCheck size={16} aria-hidden />}
      aria-label="Marcar todas as mensagens como lidas"
    >
      {busy ? 'A marcar…' : 'Marcar tudo como lido'}
    </Button>
  );
}
