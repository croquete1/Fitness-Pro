// src/components/client/TrainerLinks.tsx
'use client';

import React from 'react';
import UIButton from '@/components/ui/UIButton';
import type { UiTrainer } from '@/types/user';
import { useRouter } from 'next/navigation';

export default function TrainerLinks({
  clientId,
  trainers,
  currentTrainerIds,
  allowPTSelfOnly = false, // (mantido para compat; atualmente não limita sem o id do PT logado)
}: {
  clientId: string;
  trainers: UiTrainer[];
  currentTrainerIds: string[];
  allowPTSelfOnly?: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const current = new Set(currentTrainerIds);

  async function link(trainerId: string) {
    setBusyId(trainerId);
    try {
      const res = await fetch('/api/admin/trainer-clients', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ trainerId, clientId }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Falha ao associar.');
    } finally {
      setBusyId(null);
    }
  }

  async function unlink(trainerId: string) {
    setBusyId(trainerId);
    try {
      const res = await fetch('/api/admin/trainer-clients', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ trainerId, clientId }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Falha ao desassociar.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {trainers.map((t) => {
        const linked = current.has(t.id);
        return (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <strong>{t.name ?? t.email}</strong>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{t.email}</div>
            </div>

            {linked ? (
              <UIButton
                variant="outline"
                size="sm"
                onClick={() => unlink(t.id)}
                disabled={busyId === t.id}
              >
                {busyId === t.id ? 'A remover…' : 'Remover'}
              </UIButton>
            ) : (
              <UIButton
                variant="primary"
                size="sm"
                onClick={() => link(t.id)}
                disabled={busyId === t.id /* | limitar com allowPTSelfOnly se necessário */}
                title={allowPTSelfOnly ? 'Apenas o próprio PT pode associar' : undefined}
              >
                {busyId === t.id ? 'A associar…' : 'Associar'}
              </UIButton>
            )}
          </div>
        );
      })}
    </div>
  );
}
