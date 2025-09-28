// src/components/plan/DayBlocksDnD.tsx
'use client';

import * as React from 'react';
import {
  Card, CardHeader, CardContent,
  Stack, Button, CircularProgress, Typography
} from '@mui/material';
import SaveRounded from '@mui/icons-material/SaveRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';

import OrderListDnD, { type OrderItem } from '@/components/plan/OrderListDnD';

type Props = {
  /** Lista atual de blocos (id/label/order_index) */
  items: OrderItem[];
  /** Persiste a ordem no backend (chamado quando clicas "Guardar ordem") */
  onReorder: (next: OrderItem[]) => Promise<void> | void;
  /** Ações item → editar / apagar (opcional) */
  onEditBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
  /** UI */
  title?: string;
  dense?: boolean;
  loading?: boolean;
};

export default function DayBlocksDnD({
  items: itemsProp,
  onReorder,
  onEditBlock,
  onDeleteBlock,
  title = 'Ordenar blocos do dia',
  dense = true,
  loading = false,
}: Props) {
  // estado local para “drag preview”
  const [items, setItems] = React.useState<OrderItem[]>(itemsProp);
  const [initial, setInitial] = React.useState<OrderItem[]>(itemsProp);
  const [saving, setSaving] = React.useState(false);

  // sincroniza quando a prop muda (ex.: depois de refresh/guardar)
  React.useEffect(() => {
    setItems(itemsProp);
    setInitial(itemsProp);
  }, [itemsProp]);

  const handleReorder = React.useCallback((next: OrderItem[]) => {
    setItems(next);
  }, []);

  const handleReset = React.useCallback(() => {
    setItems(initial);
  }, [initial]);

  const handleSave = React.useCallback(async () => {
    if (!items.length) return;
    setSaving(true);
    try {
      // delega para API (ex.: /api/pt/plans/[planId]/days/[dayId]/blocks/reorder)
      await onReorder(items);
    } finally {
      setSaving(false);
    }
  }, [items, onReorder]);

  return (
    <Card variant="outlined">
      <CardHeader
        titleTypographyProps={{ fontWeight: 800 }}
        title={title}
        action={(
          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleReset}
              disabled={loading || saving}
              variant="outlined"
              startIcon={<ReplayRounded />}
            >
              Repor
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || saving}
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveRounded />}
            >
              Guardar ordem
            </Button>
          </Stack>
        )}
      />

      <CardContent sx={{ pt: 1.5 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Typography color="text.secondary">Sem blocos para ordenar.</Typography>
        ) : (
          // ⚠️ NÃO coloques comentários JSX dentro dos atributos
          // (ex.: items={items} {/* ... */}  ← isto quebra o parser)
          <OrderListDnD
            items={items}
            dense={dense}
            onReorder={handleReorder}
            onEdit={onEditBlock}
            onDelete={onDeleteBlock}
          />
        )}
      </CardContent>
    </Card>
  );
}
