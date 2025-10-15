'use client';

import * as React from 'react';
import { NotebookPen, Sparkles, Trash2 } from 'lucide-react';

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
    if (days < 30) return `há ${days} dia${days === 1 ? '' : 's'}`;
    const months = Math.round(days / 30);
    if (months < 12) return `há ${months} mês${months === 1 ? '' : 'es'}`;
    const years = Math.round(months / 12);
    return `há ${years} ano${years === 1 ? '' : 's'}`;
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

  const hasError = touched && draft.trim().length === 0;

  return (
    <section className="neo-panel space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="neo-panel__title flex items-center gap-2 text-lg">
            <NotebookPen className="h-5 w-5 text-primary" aria-hidden /> Notas rápidas
          </h2>
          <p className="neo-panel__subtitle">Guardadas localmente neste dispositivo</p>
        </div>
        <span className="status-pill" data-state="warn">
          Apenas local
        </span>
      </header>

      <p className="text-sm text-muted">
        Usa este painel para guardar alinhamentos internos, decisões recentes ou tarefas urgentes sem perder o foco na visão do
        produto.
      </p>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-2">
          <span className="sr-only">Adicionar nota</span>
          <textarea
            className={`neo-input neo-input--textarea${hasError ? ' neo-input--error' : ''}`}
            placeholder="Captura ideias, obstáculos ou próximos passos em segundos"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                addNote();
              }
            }}
            aria-invalid={hasError}
          />
          <span className="neo-input__helper">
            {hasError ? 'Escreve uma nota antes de guardar.' : 'Ctrl+Enter para guardar rapidamente'}
          </span>
        </label>
        <button
          type="button"
          className="btn primary h-full min-w-[160px] self-start md:self-stretch"
          onClick={addNote}
        >
          Guardar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="btn chip text-xs"
            onClick={() => handleSuggestion(suggestion)}
          >
            <Sparkles className="mr-1 h-3 w-3" aria-hidden />
            {suggestion}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="neo-surface flex items-start justify-between gap-3 rounded-2xl p-4" data-variant="neutral">
            <div className="flex-1 space-y-1">
              <p className="whitespace-pre-line text-sm text-fg">{note.text}</p>
              <span className="text-xs text-muted">{formatRelative(note.createdAt)}</span>
            </div>
            <button
              type="button"
              className="btn icon"
              aria-label="Remover nota"
              onClick={() => removeNote(note.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {notes.length === 0 && (
        <div className="neo-surface rounded-2xl border border-dashed border-white/40 p-5 text-sm text-muted dark:border-slate-700/60">
          Ainda não guardaste notas — usa as sugestões acima para começar.
        </div>
      )}
    </section>
  );
}
