'use client';
import * as React from 'react';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';

type Quote = { id: string; text: string; author?: string | null; active?: boolean };

const LOCAL_KEY = 'hms.admin.motivations';

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadLocalQuotes(): Quote[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(LOCAL_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as Quote[];
  } catch {
    return [];
  }
}

function persistLocalQuotes(quotes: Quote[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  } catch {
    // ignore
  }
}

type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="neo-toggle"
      data-state={checked ? 'on' : 'off'}
      onClick={() => onChange(!checked)}
    >
      <span className="neo-toggle__thumb" aria-hidden />
    </button>
  );
}

export default function MotivationAdminCard() {
  const [items, setItems] = React.useState<Quote[]>([]);
  const [text, setText] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [usingLocal, setUsingLocal] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setText('');
    setAuthor('');
  }, []);

  async function load() {
    try {
      const r = await fetch('/api/admin/motivations', { cache: 'no-store', credentials: 'same-origin' });
      if (r.status === 503) throw new Error('SUPABASE_UNCONFIGURED');
      const j = await r.json().catch(() => ({}));
      if (j?._supabaseConfigured === false || j?.error === 'SUPABASE_UNCONFIGURED') {
        setUsingLocal(true);
        setItems(loadLocalQuotes());
        return;
      }
      setUsingLocal(false);
      setItems(j.items || []);
    } catch (err: any) {
      if (err?.message === 'SUPABASE_UNCONFIGURED') {
        setUsingLocal(true);
        setItems(loadLocalQuotes());
      }
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      if (usingLocal) {
        const next = [
          ...items,
          { id: createId(), text, author, active: true },
        ];
        setItems(next);
        persistLocalQuotes(next);
        resetForm();
        return;
      }

      await fetch('/api/admin/motivations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author }),
        credentials: 'same-origin',
      });
      resetForm();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(q: Quote) {
    if (usingLocal) {
      const next = items.map((item) => (item.id === q.id ? { ...item, active: !q.active } : item));
      setItems(next);
      persistLocalQuotes(next);
      return;
    }
    await fetch(`/api/admin/motivations/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !q.active }),
      credentials: 'same-origin',
    });
    load();
  }

  async function remove(id: string) {
    if (usingLocal) {
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      persistLocalQuotes(next);
      return;
    }
    await fetch(`/api/admin/motivations/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    load();
  }

  return (
    <section className="neo-panel space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="neo-panel__title flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden /> Frases motivadoras
          </h2>
          <p className="neo-panel__subtitle">
            Activa mensagens inspiradoras que podem ser mostradas nos touchpoints internos da equipa.
          </p>
        </div>
        {usingLocal && <span className="status-pill" data-state="warn">Modo offline</span>}
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_auto]">
        <label className="flex flex-col gap-2">
          <span className="sr-only">Frase</span>
          <textarea
            className="neo-input neo-input--textarea"
            placeholder="Ex.: Cada treino é uma oportunidade para mostrar o futuro do fitness"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="sr-only">Autor</span>
          <input
            className="neo-input"
            placeholder="Autor (opcional)"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn primary h-full min-w-[160px] self-start md:self-stretch"
          onClick={add}
          disabled={busy || text.trim().length === 0}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              A guardar
            </span>
          ) : (
            'Adicionar'
          )}
        </button>
      </div>

      <p className="text-xs text-muted">
        Quando o Supabase estiver configurado, estas frases serão sincronizadas automaticamente com a base de dados.
      </p>

      <ul className="space-y-2">
        {items.map((q) => (
          <li key={q.id} className="neo-surface flex items-center gap-3 rounded-2xl p-4" data-variant="neutral">
            <Toggle checked={!!q.active} onChange={() => toggleActive(q)} label={q.text} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-fg">{q.text}</p>
              {q.author && <p className="text-xs italic text-muted">— {q.author}</p>}
            </div>
            <button
              type="button"
              className="btn icon"
              aria-label="Remover frase"
              onClick={() => remove(q.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <div className="neo-surface rounded-2xl border border-dashed border-white/40 p-5 text-sm text-muted dark:border-slate-700/60">
          Sem frases registadas. Adiciona algumas mensagens motivacionais para reforçar a energia do projecto.
        </div>
      )}
    </section>
  );
}
