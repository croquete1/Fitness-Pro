// src/components/plan/SessionOrderPanel.tsx
'use client';

import * as React from 'react';
import {
  Card, CardHeader, CardContent, CardActions,
  Button, Stack, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import Save from '@mui/icons-material/Save';
import Replay from '@mui/icons-material/Replay';
import OrderListDnD, { type OrderItem } from './OrderListDnD';

type Props = {
  items: OrderItem[];                 // ✅ prop correta
  onSave: (ids: string[]) => Promise<void>;
  title?: string;
};

export default function SessionOrderPanel({ items, onSave, title = 'Ordenar sessões' }: Props) {
  const [list, setList] = React.useState<OrderItem[]>(items);
  const [initial, setInitial] = React.useState<OrderItem[]>(items);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; sev: 'success' | 'error' | 'info' } | null>(null);

  React.useEffect(() => { setList(items); setInitial(items); }, [items]);

  const isDirty = React.useMemo(() => {
    const a = initial.map(i => i.id).join(',');
    const b = list.map(i => i.id).join(',');
    return a !== b;
  }, [initial, list]);

  const handleReorder = (next: OrderItem[]) => setList(next);
  const handleReset = () => setList(initial);

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      await onSave(list.map(i => i.id));
      setInitial(list);
      setToast({ msg: '✅ Ordem guardada com sucesso', sev: 'success' });
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao guardar ordem', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <CardHeader
        title={`🗂️ ${title}`}
        subheader="Arrasta para reordenar (ou usa as setas ↑/↓)."
      />
      <CardContent sx={{ pt: 1.5 }}>
        <OrderListDnD items={list} onReorder={handleReorder} dense />
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Replay />} onClick={handleReset} disabled={!isDirty || saving}>
            Repor
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <Save />}
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            Guardar ordem
          </Button>
        </Stack>
      </CardActions>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast && <Alert onClose={() => setToast(null)} severity={toast.sev} variant="filled">{toast.msg}</Alert>}
      </Snackbar>
    </Card>
  );
}
