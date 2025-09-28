// src/components/plan/SessionOrderPanel.tsx
'use client';

import * as React from 'react';
import {
  Card, CardHeader, CardContent,
  Stack, Button, CircularProgress, Typography,
} from '@mui/material';
import SaveRounded from '@mui/icons-material/SaveRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';

import OrderListDnD, { type OrderItem } from '@/components/plan/OrderListDnD';

type Props = {
  /** Lista inicial de sessões (id/label/order_index) */
  items: OrderItem[];
  /** Guardar (persiste ordem). Recebe a lista de IDs na nova ordem. */
  onSave: (ids: string[]) => Promise<void> | void;
  /** Título opcional do painel */
  title?: string;
  /** Estado externo de carregamento (opcional) */
  loading?: boolean;
  /** Modo compacto (true por omissão) */
  dense?: boolean;
};

export default function SessionOrderPanel({
  items: itemsProp,
  onSave,
  title = 'Ordenar sessões do dia',
  loading = false,
  dense = true,
}: Props) {
  // Estado local para “preview” da ordem antes de guardar
  const [items, setItems] = React.useState<OrderItem[]>(itemsProp);
  const [initial, setInitial] = React.useState<OrderItem[]>(itemsProp);
  const [saving, setSaving] = React.useState(false);

  // Sincroniza quando o pai atualiza a lista
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
      await onSave(items.map((it) => it.id));
      setInitial(items);
    } finally {
      setSaving(false);
    }
  }, [items, onSave]);

  return (
    <Card variant="outlined">
      <CardHeader
        titleTypographyProps={{ fontWeight: 800 }}
        title={title}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={loading || saving}
              startIcon={<ReplayRounded />}
            >
              Repor
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || saving}
              startIcon={saving ? <CircularProgress size={18} /> : <SaveRounded />}
            >
              Guardar ordem
            </Button>
          </Stack>
        }
      />
      <CardContent sx={{ pt: 1.5 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Typography color="text.secondary">Sem sessões para ordenar.</Typography>
        ) : (
          <OrderListDnD
            items={items}
            dense={dense}
            onReorder={handleReorder}
          />
        )}
      </CardContent>
    </Card>
  );
}
