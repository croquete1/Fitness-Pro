'use client';
import React, { useCallback, useState } from 'react';
import PlanWizard from '@/components/plan/PlanWizard';

type LiteClient = { id: string; name: string | null; email: string };

export default function PlanQuickCreate({ clients = [] }: { clients?: LiteClient[] }) {
  const [okMsg, setOk] = useState<string>('');
  const [errMsg, setErr] = useState<string>('');

  const onCreate = useCallback(async (p: { title: string; description?: string | null; clientId?: string | null }) => {
    setOk('');
    setErr('');
    try {
      const res = await fetch('/api/pt/training-plans', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk('Plano criado com sucesso ✅');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erro ao criar plano.');
    }
  }, []);

  return (
    <div className="grid gap-2">
      <PlanWizard onCreate={onCreate} clients={clients} />
      {okMsg && <p className="text-sm text-emerald-600">{okMsg}</p>}
      {errMsg && <p className="text-sm text-rose-600">{errMsg}</p>}
    </div>
  );
}
