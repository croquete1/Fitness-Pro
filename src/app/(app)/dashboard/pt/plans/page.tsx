'use client';

import * as React from 'react';
import clsx from 'clsx';
import { addDays, startOfWeek } from 'date-fns';

import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from '@/components/ui/Toaster';

type Sess = {
  id: string;
  title: string | null;
  kind: string | null;
  start_at: string;
  order_index: number;
  client_id: string | null;
};

const API = '/api/pt/plans';

type SessionMap = Record<string, Sess[]>;

function formatKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatLabel(date: Date) {
  const weekday = date.toLocaleDateString('pt-PT', { weekday: 'short' });
  return `${weekday} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
}

function isAbortError(error: unknown) {
  if (!error) return false;
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }
  if (error instanceof Error) {
    return error.name === 'AbortError';
  }
  return false;
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (data && typeof data === 'object') {
      const withMessage = data as { message?: unknown; error?: unknown };
      const message = withMessage.message ?? withMessage.error;
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }
  } catch (error) {
    if (!isAbortError(error)) {
      try {
        const text = await response.text();
        if (text.trim()) {
          return text.trim();
        }
      } catch (innerError) {
        if (isAbortError(innerError)) {
          return null;
        }
      }
    }
    return null;
  }

  return null;
}

function coerceSessions(value: unknown): Sess[] {
  if (!Array.isArray(value)) return [];
  return value.filter((session): session is Sess => {
    if (!session || typeof session !== 'object') return false;
    const candidate = session as Partial<Sess>;
    return typeof candidate.id === 'string' && typeof candidate.start_at === 'string';
  });
}

function cloneSessionMap(source: SessionMap): SessionMap {
  return Object.fromEntries(
    Object.entries(source).map(([key, sessions]) => [
      key,
      sessions.map((session) => ({ ...session })),
    ]),
  );
}

export default function PlansBoardPage() {
  const [start, setStart] = React.useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeks, setWeeks] = React.useState(2);
  const [map, setMap] = React.useState<SessionMap>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const mountedRef = React.useRef(true);

  const days = React.useMemo(() => {
    const result: Date[] = [];
    for (let w = 0; w < weeks; w += 1) {
      for (let d = 0; d < 7; d += 1) {
        result.push(addDays(start, w * 7 + d));
      }
    }
    return result;
  }, [start, weeks]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const load = React.useCallback(async (options?: { preserveError?: boolean }) => {
    if (!days.length) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    if (!mountedRef.current) {
      controller.abort();
      return;
    }
    abortRef.current = controller;
    setLoading(true);
    if (!options?.preserveError) {
      setError(null);
    }
    try {
      const from = `${formatKey(days[0])}T00:00:00.000Z`;
      const to = `${formatKey(days[days.length - 1])}T23:59:59.999Z`;
      const response = await fetch(`${API}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok) {
        const message = await readErrorMessage(response);
        throw new Error(message ?? `Falha ao carregar sessões (${response.status})`);
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor ao carregar sessões.');
      }

      const payloadObject =
        payload && typeof payload === 'object'
          ? (payload as { items?: unknown; data?: unknown; sessions?: unknown })
          : {};
      const itemsCandidates = [
        Array.isArray(payload) ? payload : null,
        payloadObject.items,
        payloadObject.data,
        payloadObject.sessions,
      ];
      const items = itemsCandidates.reduce<Sess[]>((selected, candidate) => {
        if (selected.length > 0) return selected;
        const normalized = coerceSessions(candidate);
        return normalized.length > 0 ? normalized : selected;
      }, []);

      const grouped: Record<string, Sess[]> = {};
      days.forEach((date) => {
        grouped[formatKey(date)] = [];
      });

      items.forEach((session) => {
        const sessionDate = new Date(session.start_at);
        if (Number.isNaN(sessionDate.getTime())) {
          return;
        }
        const key = formatKey(sessionDate);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(session);
      });

      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => a.order_index - b.order_index || a.start_at.localeCompare(b.start_at));
      });

      if (!controller.signal.aborted && mountedRef.current) {
        setMap(grouped);
        if (options?.preserveError) {
          setError(null);
        }
      }
    } catch (err: unknown) {
      if (controller.signal.aborted || !mountedRef.current || isAbortError(err)) {
        return;
      }
      const message = err instanceof Error && err.message ? err.message : 'Falha ao carregar sessões.';
      setError(message);
      setMap({});
    } finally {
      if (mountedRef.current && abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }, [days]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const drag = React.useRef<{ day: string; index: number } | null>(null);

  const onDragStart = (day: string, index: number) => () => {
    drag.current = { day, index };
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const reorderSameDay = async (list: Sess[]) => {
    const ids = list.map((session) => session.id);
    try {
      const response = await fetch(API, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        const message =
          (await readErrorMessage(response)) ?? 'Falha ao guardar ordenação. A agenda foi restaurada.';
        toast(message, 2500, 'error');
        setError(message);
        return false;
      }
      toast('Ordem actualizada ↕️', 1500, 'success');
      return true;
    } catch (err: unknown) {
      if (isAbortError(err)) {
        return false;
      }
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Falha ao guardar ordenação. A agenda foi restaurada.';
      toast(message, 2500, 'error');
      setError(message);
      return false;
    }
  };

  const moveToDay = async (targetDay: string, list: Sess[]) => {
    const moves = list.map((session, index) => ({ id: session.id, date: targetDay, order_index: index }));
    try {
      const response = await fetch(API, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moves }),
      });
      if (!response.ok) {
        const message =
          (await readErrorMessage(response)) ?? 'Falha ao mover sessão. A agenda foi restaurada.';
        toast(message, 2500, 'error');
        setError(message);
        return false;
      }
      toast('Sessão movida ⇄', 1500, 'success');
      return true;
    } catch (err: unknown) {
      if (isAbortError(err)) {
        return false;
      }
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Falha ao mover sessão. A agenda foi restaurada.';
      toast(message, 2500, 'error');
      setError(message);
      return false;
    }
  };

  const onDrop = (targetDay: string, targetIndex: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const source = drag.current;
    drag.current = null;
    if (!source) return;

    setMap((previous) => {
      const snapshot = cloneSessionMap(previous);
      const next = cloneSessionMap(previous);

      const sourceList = next[source.day]?.slice() ?? [];
      const [moved] = sourceList.splice(source.index, 1);
      if (!moved) {
        return previous;
      }

      const isSameDay = source.day === targetDay;

      if (isSameDay) {
        sourceList.splice(targetIndex, 0, moved);
        const normalized = sourceList.map((session, index) => ({ ...session, order_index: index }));
        next[source.day] = normalized;

        void (async () => {
          const ok = await reorderSameDay(normalized);
          if (!ok && mountedRef.current) {
            setMap(() => snapshot);
            void load({ preserveError: true });
          }
        })();

        return next;
      }

      const targetList = next[targetDay]?.slice() ?? [];
      targetList.splice(targetIndex, 0, moved);
      const normalizedTarget = targetList.map((session, index) => ({ ...session, order_index: index }));
      const normalizedSource = sourceList.map((session, index) => ({ ...session, order_index: index }));

      next[targetDay] = normalizedTarget;
      next[source.day] = normalizedSource;

      void (async () => {
        const ok = await moveToDay(targetDay, normalizedTarget);
        if (!ok && mountedRef.current) {
          setMap(() => snapshot);
          void load({ preserveError: true });
        }
      })();

      return next;
    });
  };

  const statusTone = loading ? 'warn' : error ? 'danger' : 'ok';
  const statusLabel = loading ? 'A sincronizar…' : error ? 'Modo offline' : 'Sincronizado';

  return (
    <div className="trainer-plan-board">
      <PageHeader
        title="Planeador semanal"
        subtitle="Arrasta e organiza as sessões entre os dias de trabalho do PT."
        actions={<span className="status-pill" data-state={statusTone}>{statusLabel}</span>}
        sticky={false}
      />

      <section className="neo-panel trainer-plan-board__panel">
        <header className="trainer-plan-board__panelHeader">
          <div>
            <h2 className="neo-panel__title">Semanas visíveis</h2>
            <p className="neo-panel__subtitle">
              Selecciona o período e reorganiza as sessões por arrastar-e-soltar.
            </p>
          </div>
          <div className="trainer-plan-board__actions">
            <Button size="sm" variant="ghost" onClick={() => setStart(addDays(start, -7))}>
              ◀ Semana anterior
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              Hoje
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setStart(addDays(start, 7))}>
              Semana seguinte ▶
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setWeeks((value) => (value === 2 ? 3 : 2))}
            >
              {weeks === 2 ? 'Mostrar 3 semanas' : 'Mostrar 2 semanas'}
            </Button>
          </div>
        </header>

        {error && !loading && (
          <div className="neo-alert" data-tone="danger" role="alert">
            <div className="neo-alert__content">
              <p className="neo-alert__message">{error}</p>
            </div>
          </div>
        )}

        <div className={clsx('trainer-plan-board__grid', loading && 'trainer-plan-board__grid--loading')}>
          {days.map((date) => {
            const key = formatKey(date);
            const sessions = map[key] ?? [];
            const isToday = key === formatKey(new Date());
            return (
              <article key={key} className="neo-surface trainer-plan-board__day" data-today={isToday || undefined}>
                <header className="trainer-plan-board__dayHeader">
                  <div>
                    <p className="trainer-plan-board__dayLabel">{formatLabel(date)}</p>
                    <time className="trainer-plan-board__dayDate" dateTime={key}>
                      {date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                  <span className="neo-tag" data-tone={sessions.length ? 'primary' : 'neutral'}>
                    {sessions.length} sessão{sessions.length === 1 ? '' : 'ões'}
                  </span>
                </header>

                <ul
                  className="trainer-plan-board__list"
                  onDragOver={onDragOver}
                  onDrop={onDrop(key, sessions.length)}
                  aria-label={`Sessões para ${formatLabel(date)}`}
                >
                  {sessions.map((session, index) => {
                    const time = new Date(session.start_at).toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <li
                        key={session.id}
                        className="trainer-plan-board__session"
                        draggable
                        onDragStart={onDragStart(key, index)}
                        onDragOver={onDragOver}
                        onDrop={onDrop(key, index)}
                      >
                        <div className="trainer-plan-board__sessionHeader">
                          <span className="trainer-plan-board__sessionDrag" aria-hidden>
                            ↕️
                          </span>
                          <span className="trainer-plan-board__sessionTitle">{session.title ?? 'Sessão'}</span>
                          <span className="neo-tag" data-tone="neutral">
                            {session.kind ?? '—'}
                          </span>
                        </div>
                        <div className="trainer-plan-board__sessionMeta">
                          <span>{time}</span>
                          {session.client_id && (
                            <span className="trainer-plan-board__sessionClient">
                              Cliente: {session.client_id.slice(0, 6)}…
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}

                  {!loading && sessions.length === 0 && (
                    <li className="trainer-plan-board__empty" aria-hidden>
                      Solta aqui para reagendar
                    </li>
                  )}

                  {loading && (
                    <li className="trainer-plan-board__skeleton" aria-hidden>
                      <span className="neo-skeleton__line" style={{ width: '68%' }} />
                      <span className="neo-skeleton__line neo-skeleton__line--muted" style={{ width: '44%' }} />
                    </li>
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
