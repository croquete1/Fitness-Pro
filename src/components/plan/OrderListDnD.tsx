'use client';

import * as React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';

export type OrderItem = { id: string; label: string; meta?: any };

type Props = {
  list: OrderItem[];
  onReorder?: (next: OrderItem[]) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  dense?: boolean;
};

export default function OrderListDnD({
  list,
  onReorder,
  onEdit,
  onDelete,
  dense = false,
}: Props) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const reorder = React.useCallback(
    (srcId: string, destId: string) => {
      if (srcId === destId) return;
      const srcIdx = list.findIndex((x) => x.id === srcId);
      const dstIdx = list.findIndex((x) => x.id === destId);
      if (srcIdx < 0 || dstIdx < 0) return;

      const next = [...list];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(dstIdx, 0, moved);
      onReorder?.(next);
    },
    [list, onReorder]
  );

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDragId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault(); // necessário para permitir drop
    e.dataTransfer.dropEffect = 'move';
    setOverId(id);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData('text/plain');
    reorder(srcId, id);
    setDragId(null);
    setOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  // Acessibilidade: mover com teclado (↑ / ↓)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, id: string) => {
    const idx = list.findIndex((x) => x.id === id);
    if (idx < 0) return;

    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      const next = [...list];
      const [moved] = next.splice(idx, 1);
      next.splice(idx - 1, 0, moved);
      onReorder?.(next);
    }
    if (e.key === 'ArrowDown' && idx < list.length - 1) {
      e.preventDefault();
      const next = [...list];
      const [moved] = next.splice(idx, 1);
      next.splice(idx + 1, 0, moved);
      onReorder?.(next);
    }
  };

  return (
    <Box>
      <List dense={dense} disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {list.map((it) => {
          const activeOver = overId === it.id && dragId !== it.id;

          return (
            <ListItem
              key={it.id}
              component="li" // ✅ necessário quando usamos `secondaryAction`
              sx={{
                px: 1,
                borderRadius: 1.5,
                border: 1,
                borderColor: activeOver ? 'primary.main' : 'divider',
                bgcolor: activeOver ? 'action.hover' : 'background.paper',
                transition: 'background .12s ease, border-color .12s ease',
                cursor: 'grab',
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, it.id)} // ✅ HTMLLIElement
              onDragOver={(e) => handleDragOver(e, it.id)}   // ✅ HTMLLIElement
              onDrop={(e) => handleDrop(e, it.id)}            // ✅ HTMLLIElement
              onDragEnd={handleDragEnd}
              onKeyDown={(e) => handleKeyDown(e, it.id)}
              secondaryAction={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  {onEdit && (
                    <Tooltip title="Editar ✏️">
                      <IconButton size="small" onClick={() => onEdit(it.id)} aria-label="Editar">
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Apagar 🗑️">
                      <IconButton size="small" color="error" onClick={() => onDelete(it.id)} aria-label="Apagar">
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              }
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                <DragIndicator fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={it.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
