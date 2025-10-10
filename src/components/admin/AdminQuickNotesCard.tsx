'use client';

import * as React from 'react';
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const STORAGE_KEY = 'hms.admin.quicknotes';
const SUGGESTIONS = [
  'Agendar reunião com os PTs de Lisboa',
  'Validar integrações de pagamentos Stripe',
  'Criar campanha para novos clientes corporativos',
  'Rever planos inactivos há mais de 30 dias',
];

type Note = { id: string; text: string; createdAt: string };

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadInitialNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistNotes(notes: Note[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore persistence failures (private browsing, etc.)
  }
}

function formatRelative(date: string) {
  try {
    const value = new Date(date).getTime();
    const now = Date.now();
    const diff = now - value;
    if (Number.isNaN(diff)) return '';
    const minutes = Math.round(diff / (1000 * 60));
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    const days = Math.round(hours / 24);
    return `há ${days} dia${days === 1 ? '' : 's'}`;
  } catch {
    return '';
  }
}

export default function AdminQuickNotesCard() {
  const [notes, setNotes] = React.useState<Note[]>(loadInitialNotes);
  const [draft, setDraft] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setNotes(loadInitialNotes());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addNote = React.useCallback(() => {
    const text = draft.trim();
    if (!text) {
      setTouched(true);
      return;
    }
    const next: Note[] = [
      ...notes,
      { id: createId(), text, createdAt: new Date().toISOString() },
    ];
    setNotes(next);
    persistNotes(next);
    setDraft('');
    setTouched(false);
  }, [draft, notes]);

  const removeNote = React.useCallback(
    (id: string) => {
      const next = notes.filter((note) => note.id !== id);
      setNotes(next);
      persistNotes(next);
    },
    [notes],
  );

  const handleSuggestion = (suggestion: string) => {
    setDraft(suggestion);
    setTouched(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'grid', gap: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={800}>
          Notas rápidas
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Guardadas localmente
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Usa este painel para guardar alinhamentos internos, decisões recentes ou tarefas urgentes.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
        <TextField
          label="Adicionar nota"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              addNote();
            }
          }}
          fullWidth
          multiline
          minRows={2}
          error={touched && draft.trim().length === 0}
          helperText={touched && draft.trim().length === 0 ? 'Escreve uma nota antes de adicionar.' : 'Ctrl+Enter para guardar'}
        />
        <Button
          variant="contained"
          onClick={addNote}
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, minWidth: { sm: 180 } }}
        >
          Guardar
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {SUGGESTIONS.map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            onClick={() => handleSuggestion(suggestion)}
            size="small"
            variant="outlined"
          />
        ))}
      </Stack>

      <List dense sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
        {notes.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 1,
              alignItems: 'flex-start',
            }}
            secondaryAction={
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="remover" onClick={() => removeNote(note.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            }
          >
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {note.text}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {formatRelative(note.createdAt)}
                </Typography>
              }
            />
          </ListItem>
        ))}
        {notes.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Ainda não guardaste notas — usa as sugestões acima para começar.
          </Typography>
        )}
      </List>
    </Paper>
  );
}
