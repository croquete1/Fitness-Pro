'use client';

import * as React from 'react';
import Link from 'next/link';
import { formatISO, startOfWeek, endOfWeek } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Download,
  Edit3,
  MinusCircle,
  RefreshCcw,
  Repeat2,
  Trash2,
} from 'lucide-react';

import { toast } from '@/components/ui/Toaster';

type Sess = {
  id: string;
  client_id: string | null;
  title: string | null;
  kind: string | null;
  start_at: string;
  end_at: string | null;
  order_index: number;
  duration_min: number | null;
  location: string | null;
  client_attendance_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
  client_attendance_at: string | null;
};

type AttendanceMeta = {
  label: string;
  tone: 'neutral' | 'warning' | 'danger' | 'success' | 'info';
};

function weekRange(from?: string) {
  const base = from ? new Date(from) : new Date();
  const s = startOfWeek(base, { weekStartsOn: 1 });
  const e = endOfWeek(base, { weekStartsOn: 1 });
  return { start: s, end: e };
}

function moveWeek(direction: -1 | 1, from?: string) {
  const d = from ? new Date(from) : new Date();
  d.setDate(d.getDate() + 7 * direction);
  return d.toISOString();
}

function inferDuration(session: Sess) {
  if (typeof session.duration_min === 'number' && session.duration_min > 0) {
    return session.duration_min;
  }
  if (session.start_at && session.end_at) {
    return Math.max(
      30,
      Math.round((new Date(session.end_at).getTime() - new Date(session.start_at).getTime()) / 60000)
    );
  }
  return 60;
}

function toInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function attendanceMeta(status: Sess['client_attendance_status']): AttendanceMeta {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmada', tone: 'success' };
    case 'completed':
      return { label: 'Concluída', tone: 'info' };
    case 'cancelled':
      return { label: 'Cancelada', tone: 'neutral' };
    case 'no_show':
      return { label: 'Faltou', tone: 'danger' };
    default:
      return { label: 'Por confirmar', tone: 'warning' };
  }
}

export default function TrainerSessionsPage() {
  const [cursor, setCursor] = React.useState<string>(new Date().toISOString());
  const [rows, setRows] = React.useState<Sess[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortMode, setSortMode] = React.useState(false);
  const [reschedule, setReschedule] = React.useState<{ session: Sess; start: string; duration: number } | null>(null);
  const [rescheduleBusy, setRescheduleBusy] = React.useState(false);
  const [rescheduleError, setRescheduleError] = React.useState<string | null>(null);

  const wr = weekRange(cursor);
  const fromISO = formatISO(wr.start);
  const toISO = formatISO(wr.end);

  const formattedRange = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
    return `${formatter.format(wr.start)} — ${formatter.format(wr.end)}`;
  }, [wr.end, wr.start]);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ from: fromISO, to: toISO });
      const r = await fetch(`/api/pt/sessions?${q}`, { cache: 'no-store' });
      const j = await r.json();
      if (Array.isArray(j.items)) {
        setRows(
          j.items.map((item: any) => ({
            ...item,
            duration_min:
              typeof item.duration_min === 'number'
                ? item.duration_min
                : item.start_at && item.end_at
                ? Math.round((new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) / 60000)
                : null,
            location: item.location ?? null,
            client_attendance_status: item.client_attendance_status ?? 'pending',
            client_attendance_at: item.client_attendance_at ?? null,
          }))
        );
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  async function remove(id: string) {
    if (!confirm('Apagar sessão?')) return;
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    const res = await fetch(`/api/pt/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setRows(prev);
      toast('Falha ao apagar', 2000, 'error');
    } else {
      toast('Sessão apagada 🗑️', 1500, 'success');
    }
  }

  function openRescheduleDialog(session: Sess) {
    const base = session.start_at ? toInputValue(session.start_at) : '';
    setReschedule({ session, start: base, duration: inferDuration(session) });
    setRescheduleError(null);
  }

  async function saveReschedule() {
    if (!reschedule) return;
    if (!reschedule.start) {
      setRescheduleError('Escolhe data e hora válidas');
      return;
    }
    const startDate = new Date(reschedule.start);
    if (Number.isNaN(startDate.getTime())) {
      setRescheduleError('Data/hora inválida');
      return;
    }
    const duration = Number(reschedule.duration);
    if (!duration || duration <= 0) {
      setRescheduleError('Duração inválida');
      return;
    }
    setRescheduleBusy(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/pt/sessions/${reschedule.session.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ start_at: startDate.toISOString(), duration_min: duration }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setRescheduleError(msg || 'Falha ao reagendar');
        return;
      }
      toast('Sessão reagendada 🔁', 1600, 'success');
      setReschedule(null);
      await load();
    } catch {
      setRescheduleError('Falha ao reagendar');
    } finally {
      setRescheduleBusy(false);
    }
  }

  async function createQuick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = String(form.get('start') || '');
    const title = String(form.get('title') || '');
    const kind = String(form.get('kind') || 'presencial');
    if (!start) {
      toast('Indica data/hora', 2000, 'warning');
      return;
    }

    try {
      const res = await fetch('/api/pt/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ start, durationMin: 60, title, kind }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão criada 🗓️', 1800, 'success');
      event.currentTarget.reset();
      void load();
    } catch {
      toast('Falha ao criar sessão', 2000, 'error');
    }
  }

  const dragIndex = React.useRef<number | null>(null);

  const onDragStart = (i: number) => (event: React.DragEvent<HTMLTableRowElement>) => {
    if (!sortMode) return;
    dragIndex.current = i;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(i));
  };

  const onDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
    if (!sortMode) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (i: number) => async (event: React.DragEvent<HTMLTableRowElement>) => {
    if (!sortMode) return;
    event.preventDefault();
    const fromStr = event.dataTransfer.getData('text/plain');
    const from = dragIndex.current ?? (fromStr ? Number(fromStr) : -1);
    dragIndex.current = null;
    if (from < 0 || from === i) return;
    setRows((arr) => {
      const next = arr.slice();
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      const ids = next.map((session) => session.id);
      fetch('/api/pt/sessions', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
        .then((response) => {
          if (!response.ok) throw new Error('');
          toast('Ordem atualizada ↕️', 1200, 'success');
        })
        .catch(() => toast('Falha a ordenar', 1600, 'error'));
      return next;
    });
  };

  const onDragEnd = () => {
    dragIndex.current = null;
  };

  const onKeyReorder = (i: number) => (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!sortMode) return;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (i > 0) setRows((arr) => moveArray(arr, i, i - 1));
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (i < rows.length - 1) setRows((arr) => moveArray(arr, i, i + 1));
    }
  };

  const totalDuration = React.useMemo(() => rows.reduce((acc, session) => acc + inferDuration(session), 0), [rows]);
  const confirmed = React.useMemo(
    () => rows.filter((session) => ['confirmed', 'completed'].includes(session.client_attendance_status ?? '')).length,
    [rows]
  );
  const pending = React.useMemo(
    () => rows.filter((session) => (session.client_attendance_status ?? 'pending') === 'pending').length,
    [rows]
  );

  return (
    <div className="trainer-sessions" aria-live="polite">
      <header className="trainer-sessions__hero">
        <div className="trainer-sessions__heading">
          <h1 className="trainer-sessions__title">🗓️ Agenda semanal do PT</h1>
          <p className="trainer-sessions__subtitle">{formattedRange}</p>
        </div>
        <div className="trainer-sessions__heroActions">
          <button className="neo-button" onClick={() => setCursor(moveWeek(-1, cursor))}>
            <ArrowLeft size={16} aria-hidden /> Semana anterior
          </button>
          <button className="neo-button" onClick={() => setCursor(new Date().toISOString())}>
            <RefreshCcw size={16} aria-hidden /> Hoje
          </button>
          <button className="neo-button" onClick={() => setCursor(moveWeek(1, cursor))}>
            Semana seguinte <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      </header>

      <section className="neo-panel trainer-sessions__metrics">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Resumo da semana</h2>
            <p className="neo-panel__subtitle">Dados reais das sessões entre {formattedRange}.</p>
          </div>
        </header>
        <ul className="trainer-sessions__stats" role="list">
          <li>
            <article className="neo-surface" data-variant="primary">
              <span className="neo-surface__label">Sessões agendadas</span>
              <span className="neo-surface__value">{rows.length}</span>
              <span className="neo-surface__meta">Atualiza automaticamente via Supabase</span>
            </article>
          </li>
          <li>
            <article className="neo-surface" data-variant="success">
              <span className="neo-surface__label">Confirmadas</span>
              <span className="neo-surface__value">{confirmed}</span>
              <span className="neo-surface__meta">Clientes com presença confirmada</span>
            </article>
          </li>
          <li>
            <article className="neo-surface" data-variant="warning">
              <span className="neo-surface__label">Pendentes</span>
              <span className="neo-surface__value">{pending}</span>
              <span className="neo-surface__meta">A aguardar confirmação</span>
            </article>
          </li>
          <li>
            <article className="neo-surface" data-variant="neutral">
              <span className="neo-surface__label">Minutos totais</span>
              <span className="neo-surface__value">{totalDuration}</span>
              <span className="neo-surface__meta">Duração estimada do plano semanal</span>
            </article>
          </li>
        </ul>
      </section>

      <section className="neo-panel trainer-sessions__quick">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Adicionar sessão rápida</h2>
            <p className="neo-panel__subtitle">Regista treinos recorrentes sem sair da agenda.</p>
          </div>
        </header>
        <form className="trainer-sessions__quickForm" onSubmit={createQuick}>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Início</span>
            <input name="start" type="datetime-local" className="neo-input" required />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Título</span>
            <input name="title" className="neo-input" placeholder="Sessão com cliente" />
          </label>
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Tipo</span>
            <input name="kind" className="neo-input" defaultValue="presencial" />
          </label>
          <button type="submit" className="neo-button neo-button--primary">
            <CalendarCheck2 size={16} aria-hidden /> Criar
          </button>
          <button
            type="button"
            className={`neo-button${sortMode ? ' is-active' : ''}`}
            onClick={() => setSortMode((value) => !value)}
          >
            ↕️ {sortMode ? 'Terminar ordenação' : 'Ordenar sessões'}
          </button>
        </form>
      </section>

      <section className="neo-panel trainer-sessions__table">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Sessões planeadas</h2>
            <p className="neo-panel__subtitle">
              Exporta ficheiros ICS, reagenda sessões e gere confirmações em tempo real.
            </p>
          </div>
          <div className="trainer-sessions__tableActions">
            <button className="neo-button" onClick={() => void load()} disabled={loading}>
              <RefreshCcw size={16} aria-hidden /> Atualizar
            </button>
          </div>
        </header>

        <div className={`neo-table-wrapper${loading ? ' is-loading' : ''}`} role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th aria-label="Reordenar" />
                <th>Data</th>
                <th>Hora</th>
                <th>Local</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th className="trainer-sessions__actionsHeader" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="trainer-sessions__loadingCell">
                    A carregar…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📭
                      </span>
                      <p className="neo-empty__title">Sem sessões nesta semana</p>
                      <p className="neo-empty__description">Adiciona uma sessão rápida para preencher a agenda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((session, index) => {
                  const startDate = new Date(session.start_at);
                  const date = startDate.toLocaleDateString('pt-PT');
                  const time = startDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                  const attendance = attendanceMeta(session.client_attendance_status);
                  const attendanceAt = session.client_attendance_at
                    ? new Date(session.client_attendance_at).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : null;

                  return (
                    <tr
                      key={session.id}
                      draggable={sortMode}
                      onDragStart={onDragStart(index)}
                      onDragOver={onDragOver}
                      onDrop={onDrop(index)}
                      onDragEnd={onDragEnd}
                      onKeyDown={onKeyReorder(index)}
                      className={sortMode ? 'trainer-sessions__row--sortable' : undefined}
                    >
                      <td className="trainer-sessions__dragCell" aria-hidden>{sortMode ? '↕️' : ''}</td>
                      <td>{date}</td>
                      <td>{time}</td>
                      <td>{session.location ?? '—'}</td>
                      <td>{session.title ?? 'Sessão'}</td>
                      <td>{session.kind ?? '—'}</td>
                      <td>{session.client_id ? `${session.client_id.slice(0, 6)}…` : '—'}</td>
                      <td>
                        <span className="neo-tag" data-tone={attendance.tone}>
                          {attendance.label}
                        </span>
                        {attendanceAt && <span className="trainer-sessions__attendanceAt">{attendanceAt}</span>}
                      </td>
                      <td className="trainer-sessions__actionsCell">
                        <Link
                          href={`/api/sessions/${session.id}/ics`}
                          className="neo-icon-button"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Download ICS"
                          title="Download ICS"
                        >
                          <Download size={16} />
                        </Link>
                        <button
                          type="button"
                          className="neo-icon-button"
                          onClick={() => openRescheduleDialog(session)}
                          aria-label="Reagendar"
                          title="Reagendar"
                        >
                          <Repeat2 size={16} />
                        </button>
                        <Link
                          href={`/dashboard/pt/sessions/${session.id}`}
                          className="neo-icon-button"
                          aria-label="Editar"
                          title="Editar sessão"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          type="button"
                          className="neo-icon-button"
                          onClick={() => remove(session.id)}
                          aria-label="Apagar"
                          title="Apagar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {sortMode && (
          <p className="trainer-sessions__sortHint">
            Ordenação ativa. Usa arrastar e largar ou as setas do teclado para reorganizar as sessões.
          </p>
        )}
      </section>

      {reschedule && (
        <div className="neo-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="neo-dialog trainer-sessions__dialog">
            <header className="neo-dialog__header">
              <h2 className="neo-dialog__title">Reagendar sessão</h2>
              <button
                type="button"
                className="neo-icon-button"
                onClick={() => (!rescheduleBusy ? setReschedule(null) : undefined)}
                aria-label="Fechar"
                disabled={rescheduleBusy}
              >
                <MinusCircle size={18} />
              </button>
            </header>
            <div className="neo-dialog__content">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Novo início</span>
                <input
                  type="datetime-local"
                  value={reschedule.start}
                  onChange={(event) =>
                    setReschedule((prev) => (prev ? { ...prev, start: event.target.value } : prev))
                  }
                  className="neo-input"
                  disabled={rescheduleBusy}
                  required
                />
              </label>
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Duração (min)</span>
                <input
                  type="number"
                  value={reschedule.duration ?? ''}
                  onChange={(event) =>
                    setReschedule((prev) =>
                      prev ? { ...prev, duration: Number(event.target.value) } : prev
                    )
                  }
                  className="neo-input"
                  min={15}
                  step={15}
                  disabled={rescheduleBusy}
                  required
                />
              </label>
              <div className="trainer-sessions__dialogMeta">
                <p className="trainer-sessions__dialogTitle">Sessão atual</p>
                <p className="trainer-sessions__dialogDescription">
                  {new Date(reschedule.session.start_at).toLocaleString('pt-PT', {
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {reschedule.session.location && (
                  <p className="trainer-sessions__dialogLocation">
                    Local: {reschedule.session.location}
                  </p>
                )}
              </div>
              {rescheduleError && (
                <div className="neo-alert" data-tone="danger">
                  <div className="neo-alert__content">
                    <p className="neo-alert__message">{rescheduleError}</p>
                  </div>
                </div>
              )}
            </div>
            <footer className="neo-dialog__footer">
              <button
                type="button"
                className="neo-button"
                onClick={() => setReschedule(null)}
                disabled={rescheduleBusy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="neo-button neo-button--primary"
                onClick={saveReschedule}
                disabled={rescheduleBusy}
              >
                {rescheduleBusy ? 'A reagendar…' : 'Guardar'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function moveArray(list: Sess[], from: number, to: number) {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  const ids = next.map((session) => session.id);
  fetch('/api/pt/sessions', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
    .then((response) => {
      if (!response.ok) throw new Error('');
      toast('Ordem atualizada ↕️', 1200, 'success');
    })
    .catch(() => toast('Falha a ordenar', 1600, 'error'));
  return next;
}
