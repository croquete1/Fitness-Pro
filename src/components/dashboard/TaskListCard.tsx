'use client';

import * as React from 'react';
import { CheckCircle2, Circle, Clock3, Plus, Trash2 } from 'lucide-react';

type Props = {
  storageId: string;
  title: string;
  items?: string[];
};

type Task = { id: string; text: string; done: boolean };

type PersistedTasks = {
  version: number;
  list: Task[];
  updatedAt?: string | null;
};

const STORAGE_VERSION = 2;

function normaliseTasks(items: string[]): Task[] {
  return items.map((text, index) => ({
    id: `${index}`,
    text,
    done: false,
  }));
}

function parsePersisted(value: string | null, fallback: string[]): { list: Task[]; updatedAt: string | null } {
  if (!value) {
    return { list: normaliseTasks(fallback), updatedAt: null };
  }

  try {
    const parsed = JSON.parse(value) as PersistedTasks | Task[];
    if (Array.isArray(parsed)) {
      return { list: parsed, updatedAt: null };
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.list)) {
      return {
        list: parsed.list,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      };
    }
  } catch (error) {
    console.warn('[TaskListCard] Falha ao ler armazenamento local', error);
  }

  return { list: normaliseTasks(fallback), updatedAt: null };
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Sem actividade recente';
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Sem actividade recente';
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return 'Sem actividade recente';
  }
}

export default function TaskListCard({ storageId, title, items = [] }: Props) {
  const [list, setList] = React.useState<Task[]>([]);
  const [draft, setDraft] = React.useState('');
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);
  const inputId = React.useId();

  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageId) : null;
      const { list: hydrated, updatedAt } = parsePersisted(raw, items);
      setList(hydrated);
      setLastUpdated(updatedAt);
    } catch (error) {
      console.warn('[TaskListCard] Não foi possível inicializar as tarefas', error);
      setList(normaliseTasks(items));
      setLastUpdated(null);
    }
  }, [storageId, items]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedTasks = {
        version: STORAGE_VERSION,
        list,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(storageId, JSON.stringify(payload));
      setLastUpdated(payload.updatedAt ?? null);
    } catch (error) {
      console.warn('[TaskListCard] Falha ao guardar tarefas', error);
    }
  }, [list, storageId]);

  const metrics = React.useMemo(() => {
    const total = list.length;
    const completed = list.filter((task) => task.done).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const next = list.find((task) => !task.done)?.text ?? null;
    return {
      total,
      completed,
      pending,
      percentage,
      next,
      summary:
        total > 0
          ? `${completed} de ${total} concluídas (${percentage}% do plano semanal)`
          : 'Nenhuma tarefa registada',
    };
  }, [list]);

  const onToggle = React.useCallback((id: string) => {
    setList((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }, []);

  const onRemove = React.useCallback((id: string) => {
    setList((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text) return;
      const id = typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}`;
      setList((prev) => [...prev, { id, text, done: false }]);
      setDraft('');
    },
    [draft],
  );

  const onInputKey = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const form = event.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    },
    [],
  );

  return (
    <section className="neo-panel neo-stack neo-stack--lg dashboard-taskList" aria-live="polite">
      <header className="dashboard-taskList__header">
        <div className="neo-stack neo-stack--xs">
          <h2 className="neo-panel__title">{title}</h2>
          <p className="neo-panel__subtitle">{metrics.summary}</p>
        </div>
        <div className="dashboard-taskList__badges" aria-label="Resumo de tarefas">
          <span className="neo-tag" data-tone="success">
            {metrics.completed} concluída{metrics.completed === 1 ? '' : 's'}
          </span>
          <span className="neo-tag" data-tone={metrics.pending > 0 ? 'warning' : 'info'}>
            {metrics.pending} pendente{metrics.pending === 1 ? '' : 's'}
          </span>
        </div>
      </header>

      <div className="dashboard-taskList__progress" role="presentation" style={{ '--dashboard-task-progress': `${metrics.percentage}%` } as React.CSSProperties}>
        <span className="sr-only">{metrics.percentage}% concluído</span>
      </div>

      <div className="dashboard-taskList__meta" aria-live="polite">
        <span className="dashboard-taskList__metaItem">
          <Clock3 className="neo-icon neo-icon--sm" aria-hidden="true" />
          {formatTimestamp(lastUpdated)}
        </span>
        {metrics.next && (
          <span className="dashboard-taskList__metaItem">
            <Circle className="neo-icon neo-icon--sm" aria-hidden="true" />
            Próximo foco: {metrics.next}
          </span>
        )}
      </div>

      <form className="dashboard-taskList__composer" onSubmit={onSubmit} aria-labelledby={`${inputId}-label`}>
        <div className="neo-stack neo-stack--xs">
          <label htmlFor={inputId} id={`${inputId}-label`} className="dashboard-taskList__composerLabel">
            Adicionar tarefa
          </label>
          <div className="dashboard-taskList__composerField">
            <input
              id={inputId}
              type="text"
              className="neo-input"
              placeholder="ex.: Validar feedback de PT, confirmar check-ins…"
              autoComplete="off"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onInputKey}
            />
            <button type="submit" className="btn" data-variant="primary" aria-label="Guardar tarefa">
              <span className="btn__icon">
                <Plus className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">Adicionar</span>
            </button>
          </div>
        </div>
      </form>

      <ul className="dashboard-taskList__items" role="list">
        {list.length === 0 ? (
          <li className="dashboard-taskList__empty" role="status">
            <p className="neo-text--sm">Sem tarefas registadas — começa por documentar os acompanhamentos prioritários desta semana.</p>
          </li>
        ) : (
          list.map((task) => (
            <li key={task.id} className="dashboard-taskList__item" data-state={task.done ? 'done' : 'pending'}>
              <button
                type="button"
                className="dashboard-taskList__toggle"
                onClick={() => onToggle(task.id)}
                aria-pressed={task.done}
                aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
              >
                <span className="dashboard-taskList__toggleIcon" aria-hidden="true">
                  {task.done ? <CheckCircle2 className="neo-icon neo-icon--sm" /> : <Circle className="neo-icon neo-icon--sm" />}
                </span>
                <span className="dashboard-taskList__toggleLabel">{task.text}</span>
              </button>
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                data-size="sm"
                onClick={() => onRemove(task.id)}
                aria-label={`Remover tarefa ${task.text}`}
              >
                <span className="btn__icon">
                  <Trash2 className="neo-icon neo-icon--sm" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
