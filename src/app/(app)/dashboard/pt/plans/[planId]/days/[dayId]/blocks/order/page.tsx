'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  Button,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
} from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Save from '@mui/icons-material/Save';
import Replay from '@mui/icons-material/Replay';

type Item = {
  id: string;
  title: string | null;
  order_index: number | null;
};

export default function OrderBlocksPage() {
  const { planId, dayId } = useParams<{ planId: string; dayId: string }>();
  const router = useRouter();

  const [items, setItems] = React.useState<Item[]>([]);
  const [initial, setInitial] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; sev: 'success' | 'error' | 'info' } | null>(null);

  // índice atualmente “arrastado”
  const dragIndex = React.useRef<number | null>(null);

  const fetchBlocks = React.useCallback(async () => {
    setLoading(true);
    try {
      // ⚠️ Ajusta se a tua API de leitura for diferente
      const res = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { items: Item[] };
      // ordena pelo order_index asc, fallback por título
      const sorted = [...(data.items ?? [])].sort((a, b) => {
        const ai = a.order_index ?? 0;
        const bi = b.order_index ?? 0;
        if (ai !== bi) return ai - bi;
        return (a.title ?? '').localeCompare(b.title ?? '');
      });
      setItems(sorted);
      setInitial(sorted);
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao carregar blocos', sev: 'error' });
      setItems([]);
      setInitial([]);
    } finally {
      setLoading(false);
    }
  }, [planId, dayId]);

  React.useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setItems(next);
  }

  const onDragStart = (i: number) => (e: React.DragEvent<HTMLLIElement>) => {
    dragIndex.current = i;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  };

  const onDragOver = (i: number) => (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault(); // necessário para permitir drop
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (i: number) => (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const fromData = e.dataTransfer.getData('text/plain');
    const from = dragIndex.current ?? (fromData ? Number(fromData) : -1);
    dragIndex.current = null;
    if (from >= 0) move(from, i);
  };

  const onDragEnd = () => {
    dragIndex.current = null;
  };

  const onKeyReorder = (i: number) => (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(i, Math.max(0, i - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(i, Math.min(items.length - 1, i + 1));
    }
  };

  const resetOrder = () => setItems(initial);

  const saveOrder = async () => {
    if (!items.length) return;
    setSaving(true);
    try {
      const pairs = items.map((it, idx) => ({ id: it.id, order_index: idx + 1 }));
      const res = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pairs }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInitial(items);
      setToast({ msg: 'Ordem guardada com sucesso ✅', sev: 'success' });
      // Se quiseres, refaz o fetch:
      // await fetchBlocks();
      router.refresh();
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao guardar ordem', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>Ordenar blocos do dia</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Replay />} variant="outlined" onClick={resetOrder} disabled={loading || saving}>
            Repor
          </Button>
          <Button startIcon={saving ? <CircularProgress size={18} /> : <Save />} variant="contained" onClick={saveOrder} disabled={loading || saving}>
            Guardar ordem
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined">
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {!loading && items.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">Sem blocos para ordenar.</Typography>
          </Box>
        )}

        {!loading && items.length > 0 && (
          <List disablePadding sx={{ p: 1, display: 'grid', gap: 0.5 }}>
            {items.map((it, i) => (
              <ListItem
                key={it.id}
                component="li"
                draggable
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDrop={onDrop(i)}
                onDragEnd={onDragEnd}
                onKeyDown={onKeyReorder(i)}
                tabIndex={0}
                aria-grabbed={dragIndex.current === i || undefined}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  px: 1,
                  '&:focus-visible': { outline: 'none', boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}40` },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      aria-label="Mover para cima"
                      onClick={() => move(i, Math.max(0, i - 1))}
                      disabled={i === 0}
                    >
                      <ArrowUpward fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Mover para baixo"
                      onClick={() => move(i, Math.min(items.length - 1, i + 1))}
                      disabled={i === items.length - 1}
                    >
                      <ArrowDownward fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Arrastar"
                      sx={{ cursor: 'grab' }}
                    >
                      <DragIndicator fontSize="inherit" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                  <DragIndicator />
                </ListItemIcon>
                <ListItemText
                  primary={it.title ?? 'Bloco'}
                  secondary={typeof it.order_index === 'number' ? `#${it.order_index}` : undefined}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast && <Alert onClose={() => setToast(null)} severity={toast.sev} variant="filled">{toast.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}
