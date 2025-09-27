// src/components/dashboard/TaskListCard.tsx
'use client';

import * as React from 'react';
import {
  Card, CardHeader, CardContent, Checkbox, List, ListItem,
  ListItemIcon, ListItemText, IconButton, Tooltip, TextField, Box
} from '@mui/material';
import DeleteForever from '@mui/icons-material/DeleteForever';
import Add from '@mui/icons-material/Add';

type Props = {
  storageId: string;
  title: string;
  items?: string[];
};

type Task = { id: string; text: string; done: boolean };

export default function TaskListCard({ storageId, title, items = [] }: Props) {
  const [list, setList] = React.useState<Task[]>([]);
  const [draft, setDraft] = React.useState('');

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageId);
      if (raw) {
        setList(JSON.parse(raw));
      } else {
        setList(items.map((t, i) => ({ id: `${i}`, text: t, done: false })));
      }
    } catch {}
  }, [storageId, items]);

  React.useEffect(() => {
    try {
      localStorage.setItem(storageId, JSON.stringify(list));
    } catch {}
  }, [list, storageId]);

  const toggle = (id: string) => setList((prev) => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setList((prev) => prev.filter(t => t.id !== id));
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setList((prev) => [...prev, { id: crypto.randomUUID?.() || String(Date.now()), text, done: false }]);
    setDraft('');
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader title={title} sx={{ pb: 0.5, '& .MuiCardHeader-title': { fontWeight: 800 } }} />
      <CardContent sx={{ pt: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Adicionar tarefa…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          />
          <IconButton color="primary" onClick={add} aria-label="Adicionar">
            <Add />
          </IconButton>
        </Box>

        <List dense disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          {list.length === 0 && (
            <ListItem sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <ListItemText primary="Sem tarefas." />
            </ListItem>
          )}
          {list.map((t) => (
            <ListItem
              key={t.id}
              sx={{
                border: 1, borderColor: 'divider', borderRadius: 2,
                bgcolor: t.done ? 'action.hover' : 'transparent'
              }}
              secondaryAction={
                <Tooltip title="Apagar">
                  <IconButton onClick={() => remove(t.id)} aria-label="Apagar tarefa">
                    <DeleteForever />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemIcon>
                <Checkbox edge="start" checked={t.done} tabIndex={-1} onChange={() => toggle(t.id)} />
              </ListItemIcon>
              <ListItemText
                primary={t.text}
                primaryTypographyProps={{
                  sx: t.done ? { textDecoration: 'line-through', opacity: .7 } : undefined
                }}
                onClick={() => toggle(t.id)}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
