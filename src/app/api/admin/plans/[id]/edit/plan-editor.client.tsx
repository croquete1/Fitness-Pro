'use client';

import * as React from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText, IconButton, Stack, Button
} from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Save from '@mui/icons-material/Save';

type Item = { id: string; title: string; order_index: number };

export default function PlanEditor({
  planId, title, initialItems
}: { planId: string; title: string; initialItems: Item[] }) {
  const [items, setItems] = React.useState<Item[]>([...initialItems].sort((a,b)=>a.order_index-b.order_index));
  const [dirty, setDirty] = React.useState(false);
  const orderize = React.useCallback((arr: Item[]) => arr.map((it, i) => ({ ...it, order_index: i })), []);

  // DnD básico (HTML5)
  const dragIdx = React.useRef<number | null>(null);

  const onDragStart = (i:number) => (e: React.DragEvent) => {
    dragIdx.current = i;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (i:number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    setItems(prev => {
      const cur = [...prev];
      const [m] = cur.splice(dragIdx.current!, 1);
      cur.splice(i, 0, m);
      dragIdx.current = i;
      setDirty(true);
      return orderize(cur);
    });
  };

  const move = (i:number, dir:-1|1) => {
    setItems(prev => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const cur = [...prev];
      const [m] = cur.splice(i,1);
      cur.splice(j,0,m);
      setDirty(true);
      return orderize(cur);
    });
  };

  const save = async () => {
    await fetch(`/api/admin/plans/${planId}/blocks/reorder`, {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify(items.map(({id,order_index}) => ({id,order_index}))),
    });
    setDirty(false);
  };

  return (
    <Paper sx={{ p: 2, display:'grid', gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{title} — Blocos</Typography>
        <Button onClick={save} variant="contained" startIcon={<Save />} disabled={!dirty}>Guardar ordem</Button>
      </Stack>

      <List dense disablePadding sx={{ display:'grid', gap: .5 }}>
        {items.map((it, i) => (
          <ListItem
            key={it.id}
            draggable
            onDragStart={onDragStart(i)}
            onDragOver={onDragOver(i)}
            secondaryAction={
              <Stack direction="row" spacing={.5}>
                <IconButton aria-label="Subir" onClick={()=>move(i,-1)}><ArrowUpward /></IconButton>
                <IconButton aria-label="Descer" onClick={()=>move(i, 1)}><ArrowDownward /></IconButton>
              </Stack>
            }
            sx={{ border:1, borderColor:'divider', borderRadius:1.5 }}
          >
            <DragIndicator sx={{ mr: 1, color:'text.secondary' }} />
            <ListItemText primaryTypographyProps={{ fontSize:14, fontWeight:600 }} primary={it.title || 'Bloco'} secondary={`#${it.order_index+1}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
