'use client';
import * as React from 'react';

export type TaskListCardProps = {
  items?: string[];
  storageId?: string;
  hidden?: boolean;
  title?: string;
  headerExtra?: React.ReactNode;
};

type TaskItem = { id: string; text: string; done: boolean };

function toTaskItems(source?: string[]): TaskItem[] {
  return (source ?? []).map((t, i) => ({
    id: `t-${i}-${Math.random().toString(36).slice(2, 8)}`,
    text: t,
    done: false,
  }));
}

export default function TaskListCard({
  items,
  storageId,
  hidden,
  title = 'Tarefas',
  headerExtra,
}: TaskListCardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [tasks, setTasks] = React.useState<TaskItem[]>(() => toTaskItems(items));

  React.useEffect(() => {
    setMounted(true);
    if (!storageId) return;
    try {
      const raw = localStorage.getItem(storageId);
      if (raw) {
        const parsed = JSON.parse(raw) as TaskItem[];
        if (Array.isArray(parsed)) setTasks(parsed);
      } else if (items?.length) {
        const seeded = toTaskItems(items);
        setTasks(seeded);
        localStorage.setItem(storageId, JSON.stringify(seeded));
      }
    } catch {}
  }, [storageId]); // seed apenas na 1ª montagem

  React.useEffect(() => {
    if (!mounted || !storageId) return;
    try {
      localStorage.setItem(storageId, JSON.stringify(tasks));
    } catch {}
  }, [tasks, storageId, mounted]);

  const toggle = (id: string) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const add = (text: string) => {
    if (!text.trim()) return;
    setTasks(prev => [...prev, { id: `t-${Date.now().toString(36)}`, text: text.trim(), done: false }]);
  };

  const [newText, setNewText] = React.useState('');
  if (hidden) return null;

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold opacity-80">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-60">
            {tasks.filter(t => !t.done).length} por fazer
          </span>
          {headerExtra}
        </div>
      </div>

      <ul className="space-y-2">
        {tasks.length === 0 ? (
          <li className="text-sm opacity-60">Sem tarefas.</li>
        ) : (
          tasks.map(t => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-black dark:accent-white"
                  checked={t.done}
                  onChange={() => toggle(t.id)}
                />
                <span className={`text-sm ${t.done ? 'line-through opacity-50' : ''}`}>{t.text}</span>
              </label>
              <button type="button" onClick={() => remove(t.id)} title="Remover" className="text-xs opacity-60 hover:opacity-100">
                ✕
              </button>
            </li>
          ))
        )}
      </ul>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={e => {
          e.preventDefault();
          add(newText);
          setNewText('');
        }}
      >
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Adicionar tarefa…"
          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
        />
        <button
          type="submit"
          className="text-sm rounded-lg px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
