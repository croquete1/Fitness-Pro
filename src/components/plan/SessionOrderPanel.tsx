'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent, Snackbar, Alert } from '@mui/material';
import OrderListDnD, { type OrderItem } from './OrderListDnD';

type Props = {
  /** Lista inicial de sessões (id + label) */
  items: OrderItem[];
  /**
   * Persistência no servidor: recebe a nova ordem de IDs
   * e deve gravar (ex.: POST /api/pt/sessions/order).
   */
  onSave: (ids: string[]) => Promise<void>;
  /** Título opcional no topo do card */
  title?: string;
};

export default function SessionOrderPanel({ items, onSave, title = '📅 Ordenar sessões' }: Props) {
  const [list, setList] = React.useState<OrderItem[]>(items);
  const [busy, setBusy] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  // Mantém sincronizado se o pai atualizar "items"
  React.useEffect(() => { setList(items); }, [items]);

  const persist = React.useCallback(
    async (next: OrderItem[]) => {
      setBusy(true);
      try {
        await onSave(next.map(x => x.id));
        setOkMsg('✅ Ordem guardada');
      } catch (e: any) {
        setErrMsg(e?.message || 'Erro ao guardar a ordem');
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [onSave]
  );

  const handleReorder = async (next: OrderItem[]) => {
    const prev = list;
    setList(next);      // otimista
    try {
      await persist(next);
    } catch {
      setList(prev);    // rollback em caso de falha
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
          list={list}            // ✅ nome correto da prop
          onReorder={handleReorder} // ✅ callback correto
          dense
        />
      </CardContent>

      <Snackbar open={!!okMsg} autoHideDuration={2000} onClose={() => setOkMsg(null)}>
        <Alert severity="success" onClose={() => setOkMsg(null)}>{okMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!errMsg} autoHideDuration={3000} onClose={() => setErrMsg(null)}>
        <Alert severity="error" onClose={() => setErrMsg(null)}>{errMsg}</Alert>
      </Snackbar>
    </Card>
  );
}
