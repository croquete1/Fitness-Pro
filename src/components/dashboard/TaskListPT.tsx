'use client';

import * as React from 'react';
import {
  Paper, Stack, Typography, TextField, Button, List, ListItem,
  ListItemIcon, ListItemText, IconButton, Tooltip, Divider
} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

type Task = { id: string; text: string; done: boolean };

const STORAGE_KEY = 'pt.tasks.today';

// util id estável
function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export default function TaskListPT() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTasks(JSON.parse(raw));
      } else {
        setTasks([
          { id: makeId(), text: 'Rever plano do próximo cliente 📝', done: false },
          { id: makeId(), text: 'Confirmar horários desta semana 📅', done: false },
          { id: makeId(), text: 'Dar feedback (últimos treinos) 💬', done: false },
        ]);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  const add = () => {
    const t = input.trim();
    if (!t) return;
    setTasks(xs => [{ id: makeId(), text: t, done: false }, ...xs]);
    setInput('');
  };
  const toggle = (id: string) => setTasks(xs => xs.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const del = (id: string) => setTasks(xs => xs.filter(x => x.id !== id));
  const edit = (id: string) => {
    const cur = tasks.find(t => t.id === id)?.text ?? '';
    const next = prompt('Editar tarefa:', cur);
    if (next && next.trim()) setTasks(xs => xs.map(x => x.id === id ? { ...x, text: next.trim() } : x));
  };
  const move = (id: string, dir: -1 | 1) =>
    setTasks(xs => {
      const i = xs.findIndex(x => x.id === id);
      if (i < 0) return xs;
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const copy = xs.slice();
      const [it] = copy.splice(i, 1);
      copy.splice(j, 0, it);
      return copy;
    });

  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={800}>Tarefas do dia (PT)</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Nova tarefa…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            sx={{ minWidth: { xs: 'auto', sm: 280 } }}
          />
          <Button onClick={add} variant="contained" startIcon={<AddIcon />}>Adicionar</Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 1 }} />

      <List dense disablePadding>
        {tasks.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Sem tarefas por agora. Boa! ✨
          </Typography>
        )}
        {tasks.map((t, i) => (
          <ListItem
            key={t.id}
            sx={{
              px: 1,
              borderRadius: 1.5,
              '& + &': { mt: 0.5 },
              bgcolor: t.done ? 'action.selected' : 'transparent',
            }}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Mover para cima"><span>
                  <IconButton edge="end" aria-label="Subir" onClick={() => move(t.id, -1)} disabled={i === 0}>
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Mover para baixo"><span>
                  <IconButton edge="end" aria-label="Descer" onClick={() => move(t.id, 1)} disabled={i === tasks.length - 1}>
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Editar">
                  <IconButton edge="end" aria-label="Editar" onClick={() => edit(t.id)}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Apagar">
                  <IconButton edge="end" aria-label="Apagar" onClick={() => del(t.id)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
              <IconButton
                aria-label={t.done ? 'Desmarcar' : 'Marcar como concluída'}
                onClick={() => toggle(t.id)}
                size="small"
              >
                <CheckCircleOutline color={t.done ? 'primary' : 'inherit'} fontSize="small" />
              </IconButton>
            </ListItemIcon>
            <ListItemText
              primary={t.text}
              primaryTypographyProps={{ sx: { textDecoration: t.done ? 'line-through' : 'none' } }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
