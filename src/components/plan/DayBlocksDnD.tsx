'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent, Snackbar, Alert } from '@mui/material';
import OrderListDnD, { type OrderItem } from './OrderListDnD';

type Block = { id: string; label: string };
type Props = {
  planId: string;
  dayId: string;
  initial: Block[];           // blocos do dia (na ordem atual)
  title?: string;             // título opcional para este dia (ex.: "Segunda-feira")
  onEditBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
};

export default function DayBlocksDnD({
  planId,
  dayId,
  initial,
  title = 'Blocos do dia',
  onEditBlock,
  onDeleteBlock,
}: Props) {
  const [items, setItems] = React.useState<OrderItem[]>(
    () => initial.map(b => ({ id: b.id, label: b.label }))
  );
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const persist = React.useCallback(async (next: OrderItem[]) => {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/pt/plans/${encodeURIComponent(planId)}/days/${encodeURIComponent(dayId)}/blocks/reorder`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: next.map(x => x.id) }),
        }
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || 'Falha ao gravar ordem.');
      }
      setMsg('✅ Ordem guardada');
    } catch (e: any) {
      setErr(e?.message || 'Erro ao gravar ordem.');
      // rollback visual: nada a fazer porque só aplicamos estado local ao final
      throw e;
    } finally {
      setBusy(false);
    }
  }, [planId, dayId]);

  const handleReorder = async (next: OrderItem[]) => {
    const prev = items;
    setItems(next); // otimista
    try {
      await persist(next);
    } catch {
      setItems(prev); // rollback
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardHeader
        title={title}
        subheader={busy ? 'A guardar…' : 'Arrasta para ordenar • Usa ↑/↓ para mover'}
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 1.5 }}>
        <OrderListDnD
          list={items}
          onReorder={handleReorder}
          onEdit={onEditBlock}
          onDelete={onDeleteBlock}
          dense
        />
      </CardContent>

      <Snackbar open={!!msg} autoHideDuration={2000} onClose={() => setMsg(null)}>
        <Alert severity="success" onClose={() => setMsg(null)}>{msg}</Alert>
      </Snackbar>
      <Snackbar open={!!err} autoHideDuration={3000} onClose={() => setErr(null)}>
        <Alert severity="error" onClose={() => setErr(null)}>{err}</Alert>
      </Snackbar>
    </Card>
  );
}
