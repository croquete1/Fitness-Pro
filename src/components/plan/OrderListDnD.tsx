// src/components/plan/OrderListDnD.tsx
'use client';

import * as React from 'react';
import {
  List, ListItem, ListItemIcon, ListItemText, IconButton, Stack,
} from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

export type OrderItem = {
  id: string;
  label?: string | null;
  secondary?: string | null;
};

type Props = {
  /** Array na ordem atual (controlado pelo pai) */
  items: OrderItem[];
  /** Devolve o array na nova ordem sempre que reordenares */
  onReorder: (next: OrderItem[]) => void;
  /** Ações opcionais por item */
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Lista compacta */
  dense?: boolean;
};

export default function OrderListDnD({
  items, onReorder, onEdit, onDelete, dense,
}: Props) {
  const dragIndex = React.useRef<number | null>(null);

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onReorder(next);
  }

  const onDragStart = (i: number) => (e: React.DragEvent<HTMLLIElement>) => {
    dragIndex.current = i;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  };
  const onDragOver = (_i: number) => (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (i: number) => (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const fromStr = e.dataTransfer.getData('text/plain');
    const from = dragIndex.current ?? (fromStr ? Number(fromStr) : -1);
    dragIndex.current = null;
    if (from >= 0) move(from, i);
  };
  const onDragEnd = () => { dragIndex.current = null; };

  const onKeyReorder = (i: number) => (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); move(i, Math.max(0, i - 1)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(i, Math.min(items.length - 1, i + 1)); }
  };

  return (
    <List dense={dense} disablePadding sx={{ display: 'grid', gap: 0.5 }}>
      {items.map((it, i) => (
        <ListItem
          key={it.id}
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
            '&:focus-visible': (t) => ({ outline: 'none', boxShadow: `0 0 0 3px ${t.palette.primary.main}40` }),
          }}
          secondaryAction={
            <Stack direction="row" spacing={0.5}>
              {onEdit && (
                <IconButton size="small" aria-label="Editar" onClick={() => onEdit(it.id)}>
                  <Edit fontSize="inherit" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" aria-label="Apagar" onClick={() => onDelete(it.id)}>
                  <Delete fontSize="inherit" />
                </IconButton>
              )}
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
              <IconButton size="small" aria-label="Arrastar" sx={{ cursor: 'grab' }}>
                <DragIndicator fontSize="inherit" />
              </IconButton>
            </Stack>
          }
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
            <DragIndicator />
          </ListItemIcon>
          <ListItemText
            primary={it.label ?? 'Elemento'}
            secondary={it.secondary ?? undefined}
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
      ))}
    </List>
  );
}
