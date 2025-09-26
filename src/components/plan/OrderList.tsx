'use client';

import * as React from 'react';
import { List, ListItem, ListItemText, IconButton, Stack, Tooltip } from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import DragIndicator from '@mui/icons-material/DragIndicator';

export type OrderItem = { id: string; label: string; meta?: any };

type Props = {
  items: OrderItem[];
  onChange?: (next: OrderItem[]) => void;
  onSave?: (ids: string[]) => Promise<void> | void;
  dense?: boolean;
};

export default function OrderList({ items, onChange, onSave, dense }: Props) {
  const [list, setList] = React.useState<OrderItem[]>(items);

  React.useEffect(() => setList(items), [items]);

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const copy = list.slice();
    const [it] = copy.splice(idx, 1);
    copy.splice(j, 0, it);
    setList(copy);
    onChange?.(copy);
  };

  const save = async () => {
    try { await onSave?.(list.map(x => x.id)); } catch {}
  };

  return (
    <List dense={dense} disablePadding sx={{ display: 'grid', gap: 0.5 }}>
      {list.map((it, i) => (
        <ListItem
          key={it.id}
          secondaryAction={
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Subir"><span>
                <IconButton onClick={() => move(i, -1)} size="small" disabled={i === 0}>
                  <ArrowUpward fontSize="small" />
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Descer"><span>
                <IconButton onClick={() => move(i, 1)} size="small" disabled={i === list.length - 1}>
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </span></Tooltip>
            </Stack>
          }
          sx={{ px: 1, borderRadius: 1.5, border: 1, borderColor: 'divider' }}
        >
          <DragIndicator fontSize="small" style={{ opacity: .6, marginRight: 8 }} />
          <ListItemText primary={it.label} />
        </ListItem>
      ))}
      {/* Botão de guardar (se fornecido onSave) */}
      {onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button className="btn primary" onClick={save}>💾 Guardar ordem</button>
        </div>
      )}
    </List>
  );
}
