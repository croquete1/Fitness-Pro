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
    <section className="neo-panel admin-panel">
      <header className="neo-panel__header admin-panel__header">
        <div>
          <h2 className="neo-panel__title admin-panel__title">
            <NotebookPen className="neo-icon" aria-hidden /> Notas rápidas
          </h2>
          <p className="neo-panel__subtitle">Guardadas localmente neste dispositivo</p>
        </div>
        <span className="status-pill" data-state="warn">
          Apenas local
        </span>
      </header>

      <p className="neo-text--sm text-muted">
        Usa este painel para guardar alinhamentos internos, decisões recentes ou tarefas urgentes sem perder o foco na visão do
        produto.
      </p>

      <div className="admin-notes__form">
        <label className="admin-notes__field">
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
          className="btn admin-notes__submit"
          data-variant="primary"
          data-size="md"
          onClick={addNote}
        >
          Guardar
        </button>
      </div>

      <div className="admin-notes__suggestions">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="admin-notes__chip"
            onClick={() => handleSuggestion(suggestion)}
          >
            <Sparkles className="neo-icon neo-icon--xs" aria-hidden />
            {suggestion}
          </button>
        ))}
      </div>

      <ul className="admin-notes__list">
        {notes.map((note) => (
          <li key={note.id} className="neo-surface admin-notes__note" data-variant="neutral">
            <div className="admin-notes__note-body">
              <p className="admin-notes__note-text">{note.text}</p>
              <span className="admin-notes__note-meta">{formatRelative(note.createdAt)}</span>
            </div>
            <button
              type="button"
              className="btn admin-notes__remove"
              data-variant="ghost"
              aria-label="Remover nota"
              onClick={() => removeNote(note.id)}
            >
              <Trash2 className="neo-icon neo-icon--sm" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {notes.length === 0 && (
        <div className="admin-panel__empty">
          Ainda não guardaste notas — usa as sugestões acima para começar.
        </div>
      )}
    </section>
  );
}
