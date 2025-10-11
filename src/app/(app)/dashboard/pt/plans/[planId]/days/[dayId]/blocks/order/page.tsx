'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Card, CardHeader, CardContent, CardActions,
  Button, Stack, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import Save from '@mui/icons-material/Save';
import Replay from '@mui/icons-material/Replay';
import OrderListDnD, { type OrderItem } from '@/components/plan/OrderListDnD';

export default function OrderBlocksPage() {
  const { planId, dayId } = useParams<{ planId: string; dayId: string }>();
  const router = useRouter();

  const [items, setItems] = React.useState<OrderItem[]>([]);
  const [initial, setInitial] = React.useState<OrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; sev: 'success' | 'error' | 'info' } | null>(null);

  const fetchBlocks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { items: { id: string; title?: string | null; order_index?: number | null }[] };
      const mapped: OrderItem[] = (json.items ?? [])
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((b) => ({ id: String(b.id), label: b.title ?? 'Bloco' }));
      setItems(mapped);
      setInitial(mapped);
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao carregar blocos', sev: 'error' });
      setItems([]); setInitial([]);
    } finally {
      setLoading(false);
    }
  }, [planId, dayId]);

  React.useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const isDirty = React.useMemo(() => initial.map(i => i.id).join(',') !== items.map(i => i.id).join(','), [initial, items]);

  const handleReorder = (next: OrderItem[]) => setItems(next);
  const handleReset = () => setItems(initial);

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const pairs = items.map((it, idx) => ({ id: it.id, order_index: idx + 1 }));
      const res = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks/reorder`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pairs }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInitial(items);
      setToast({ msg: '✅ Ordem guardada', sev: 'success' });
      router.refresh();
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao guardar ordem', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', py: 3, px: { xs: 2, md: 3 } }}>
      <Container maxWidth={false} sx={{ px: 0, width: '100%' }}>
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <CardHeader title="🧩 Ordenar blocos do dia" subheader="Arrasta ou usa ↑/↓ para reordenar." />
          <CardContent sx={{ pt: 1.5 }}>
            {loading ? (
              <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
            ) : (
              <OrderListDnD items={items} onReorder={handleReorder} dense />
            )}
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Replay />} onClick={handleReset} disabled={!isDirty || saving}>Repor</Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} /> : <Save />} onClick={handleSave} disabled={!isDirty || saving}>
                Guardar ordem
              </Button>
            </Stack>
          </CardActions>
        </Card>

        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          {toast && <Alert onClose={() => setToast(null)} severity={toast.sev} variant="filled">{toast.msg}</Alert>}
        </Snackbar>
      </Container>
    </Box>
  );
}
