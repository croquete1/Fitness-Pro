// src/app/(app)/dashboard/my-plan/[id]/client.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import PlanViewBeacon from "@/components/PlanViewBeacon";
import { toast } from "sonner";
import type { ClientPlanDetail } from "@/lib/client/plans/detail/types";

type NormalizedExerciseLog = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  weights: string[];
  note: string | null;
  createdAt: string | null;
};

type WorkoutNote = {
  id: string;
  note: string | null;
  photoPath: string | null;
  createdAt: string | null;
};

type ExerciseLogsMap = Partial<Record<string, NormalizedExerciseLog>>;

type CachedDay = {
  logs: ExerciseLogsMap;
  notes: WorkoutNote[];
};

type DraftDay = {
  note: string;
  photo: string | null;
};

const WEEKDAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function dayLabel(idx: number) {
  return WEEKDAY_SHORT[idx] ?? `Dia ${idx + 1}`;
}

function formatDateWithWeekday(offset: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  const dow = (today.getDay() + 6) % 7;
  weekStart.setDate(today.getDate() - dow);
  const day = new Date(weekStart);
  day.setDate(weekStart.getDate() + offset);
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(day);
  } catch {
    return `${offset + 1}`;
  }
}

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toString().toUpperCase();
  if (["ATIVO", "ACTIVE", "APPROVED", "LIVE"].includes(normalized)) return "success";
  if (["PAUSADO", "PAUSED", "PENDING", "DRAFT", "WAITING"].includes(normalized)) return "warning";
  if (["CANCELADO", "CANCELLED", "ARCHIVED", "INACTIVE"].includes(normalized)) return "danger";
  return "neutral";
}

export default function PlanDetailClient({
  meId: _meId,
  role,
  plan,
  fallback = false,
}: {
  meId: string;
  role: "CLIENT" | "PT" | "ADMIN";
  plan: ClientPlanDetail;
  fallback?: boolean;
}) {
  const router = useRouter();
  const [dayIdx, setDayIdx] = React.useState<number>((new Date().getDay() + 6) % 7);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [dayNote, setDayNote] = React.useState("");
  const [photoPath, setPhotoPath] = React.useState<string | null>(null);
  const [savingNote, setSavingNote] = React.useState(false);
  const [loadingDayData, setLoadingDayData] = React.useState(false);
  const [noteHistory, setNoteHistory] = React.useState<WorkoutNote[]>([]);
  const [exerciseLogs, setExerciseLogs] = React.useState<ExerciseLogsMap>({});

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const cacheRef = React.useRef<Map<number, CachedDay>>(new Map());
  const draftsRef = React.useRef<Map<number, DraftDay>>(new Map());

  const days = React.useMemo(
    () => [...plan.days].sort((a, b) => a.dayIndex - b.dayIndex),
    [plan.days],
  );
  const currentDay = React.useMemo(
    () => days.find((day) => day.dayIndex === dayIdx) ?? days[0] ?? { dayIndex: dayIdx, items: [] },
    [days, dayIdx],
  );
  const heroMetrics = React.useMemo(() => {
    const totalExercises = days.reduce((acc, day) => acc + day.items.length, 0);
    const activeDays = days.filter((day) => day.items.length > 0).length;
    const start = plan.startDate ? new Date(plan.startDate) : null;
    const end = plan.endDate ? new Date(plan.endDate) : null;
    const formatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
    const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
    const durationDays = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000)) : null;
    const statusChipTone = statusTone(plan.status);
    const statusHeroTone = plan.status
      ? statusChipTone === 'success'
        ? 'positive'
        : statusChipTone === 'danger'
          ? 'critical'
          : statusChipTone === 'warning'
            ? 'warning'
            : 'neutral'
      : fallback
        ? 'warning'
        : 'neutral';
    const statusValue = plan.status
      ? plan.status.toString().toUpperCase()
      : fallback
        ? 'INDISPONÍVEL OFFLINE'
        : 'SEM ESTADO';
    const statusHint = start && end
      ? `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`
      : fallback
        ? 'Sincroniza novamente para veres as datas.'
        : 'Sem datas definidas';

    return [
      {
        id: 'status',
        label: 'Estado',
        value: statusValue,
        hint: statusHint,
        tone: statusHeroTone,
      },
      {
        id: 'exercises-week',
        label: 'Exercícios na grelha',
        value: formatter.format(totalExercises),
        hint: `${activeDays} dia${activeDays === 1 ? '' : 's'} com treino`,
        tone: totalExercises > 0 ? 'positive' : 'neutral',
      },
      {
        id: 'duration',
        label: 'Duração prevista',
        value: durationDays ? `${durationDays} dia${durationDays === 1 ? '' : 's'}` : '—',
        hint: start && end ? 'Do início ao fim definidos' : fallback ? 'Sem dados disponíveis offline' : 'Sem datas definidas',
        tone: durationDays ? 'neutral' : fallback ? 'warning' : 'neutral',
      },
      {
        id: 'today',
        label: 'Dia seleccionado',
        value: dayLabel(currentDay.dayIndex),
        hint: `${currentDay.items.length} exercício${currentDay.items.length === 1 ? '' : 's'} para hoje`,
        tone: currentDay.items.length > 0 ? 'positive' : 'neutral',
      },
    ] as const;
  }, [days, plan.startDate, plan.endDate, plan.status, currentDay.dayIndex, currentDay.items.length, fallback]);

  const handleSelectDay = React.useCallback(
    (nextIdx: number) => {
      draftsRef.current.set(dayIdx, { note: dayNote, photo: photoPath });
      setDayIdx(nextIdx);
    },
    [dayIdx, dayNote, photoPath],
  );

  React.useEffect(() => {
    draftsRef.current.set(dayIdx, { note: dayNote, photo: photoPath });
  }, [dayIdx, dayNote, photoPath]);

  React.useEffect(() => {
    const draft = draftsRef.current.get(dayIdx);
    setDayNote(draft?.note ?? "");
    setPhotoPath(draft?.photo ?? null);

    if (fallback) {
      setLoadingDayData(false);
      setExerciseLogs({});
      setNoteHistory([]);
      return;
    }

    const cached = cacheRef.current.get(dayIdx);
    if (cached) {
      setExerciseLogs(cached.logs);
      setNoteHistory(cached.notes);
      setLoadingDayData(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadDayData() {
      setLoadingDayData(true);
      setExerciseLogs({});
      setNoteHistory([]);
      try {
        const search = new URLSearchParams({ planId: plan.id, dayIndex: String(dayIdx) });
        const [logsRes, notesRes] = await Promise.all([
          fetch(`/api/logs/exercise?${search.toString()}`, { signal: controller.signal }),
          fetch(`/api/logs/day-note?${search.toString()}`, { signal: controller.signal }),
        ]);

        if (!logsRes.ok) {
          const err = await logsRes.json().catch(() => null);
          throw new Error(err?.error || "Erro ao carregar séries.");
        }
        if (!notesRes.ok) {
          const err = await notesRes.json().catch(() => null);
          throw new Error(err?.error || "Erro ao carregar notas.");
        }

        const logsJson = await logsRes.json();
        const notesJson = await notesRes.json();
        if (!active) return;

        const normalizedLogs: ExerciseLogsMap = {};
        for (const row of logsJson?.logs ?? []) {
          const normalized = normalizeExerciseLog(row);
          if (normalized && !normalizedLogs[normalized.exerciseId]) {
            normalizedLogs[normalized.exerciseId] = normalized;
          }
        }
        const notes = (notesJson?.notes ?? []).map(normalizeNote);

        setExerciseLogs(normalizedLogs);
        setNoteHistory(notes);
        cacheRef.current.set(dayIdx, { logs: normalizedLogs, notes });
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Failed to load day data", error);
        toast.error(error?.message || "Não foi possível carregar os registos do dia.");
        if (active) {
          setExerciseLogs({});
          setNoteHistory([]);
          cacheRef.current.delete(dayIdx);
        }
      } finally {
        if (active) setLoadingDayData(false);
      }
    }

    loadDayData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [plan.id, dayIdx, fallback]);

  React.useEffect(() => {
    cacheRef.current.set(dayIdx, { logs: exerciseLogs, notes: noteHistory });
  }, [dayIdx, exerciseLogs, noteHistory]);

  const handleLogSaved = React.useCallback(
    (exerciseId: string, log: NormalizedExerciseLog) => {
      setExerciseLogs((prev) => {
        const next = { ...prev, [exerciseId]: log };
        cacheRef.current.set(dayIdx, { logs: next, notes: noteHistory });
        return next;
      });
    },
    [dayIdx, noteHistory],
  );

  async function handleUpload(file: File) {
    if (fallback) {
      toast.error("Funcionalidade indisponível em modo offline.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads/workout-photo", { method: "POST", body: fd });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.path) throw new Error(json?.error || "Falha no upload");
    setPhotoPath(json.path);
    draftsRef.current.set(dayIdx, { note: dayNote, photo: json.path });
    toast.success("Foto carregada");
  }

  async function saveDayNote() {
    if (fallback) {
      toast.error("Funcionalidade indisponível em modo offline.");
      return;
    }
    setSavingNote(true);
    try {
      const res = await fetch("/api/logs/day-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id, day_index: dayIdx, note: dayNote, photo_path: photoPath }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Erro a guardar nota");
      if (json?.note) {
        const normalized = normalizeNote(json.note);
        setNoteHistory((prev) => {
          const next = [normalized, ...prev];
          cacheRef.current.set(dayIdx, { logs: exerciseLogs, notes: next });
          return next;
        });
      }
      toast.success("Nota guardada");
      setDayNote("");
      setPhotoPath(null);
      draftsRef.current.set(dayIdx, { note: "", photo: null });
    } catch (e: any) {
      toast.error(e?.message || "Erro a guardar nota");
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="plan-detail">
      {role === "CLIENT" && !fallback ? <PlanViewBeacon planId={plan.id} /> : null}
      <section className="neo-panel plan-detail__header">
        <div className="plan-detail__heading">
          <div className="plan-detail__titleGroup">
            <h1 className="plan-detail__title">{plan.title ?? "Plano de treino"}</h1>
            <div className="plan-detail__tags">
              <span className="neo-tag" data-tone={statusTone(plan.status)}>
                {plan.status ? plan.status.toString().toUpperCase() : "—"}
              </span>
              {plan.startDate && (
                <span className="neo-tag" data-tone="neutral">
                  Início: {new Date(plan.startDate).toLocaleDateString("pt-PT")}
                </span>
              )}
              {plan.endDate && (
                <span className="neo-tag" data-tone="neutral">
                  Fim: {new Date(plan.endDate).toLocaleDateString("pt-PT")}
                </span>
              )}
            </div>
          </div>
          <div className="plan-detail__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/dashboard/sessions")}
            >
              📅 Sessões
            </Button>
            {(role === "PT" || role === "ADMIN") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/plans/${plan.id}/print`)}
              >
                🖨️ Exportar PDF
              </Button>
            )}
          </div>
        </div>
      </section>

      {fallback ? (
        <Alert tone="warning" title="Modo offline" className="plan-detail__alert">
          Não foi possível sincronizar o plano — mostraremos informação limitada até restabeleceres a ligação.
        </Alert>
      ) : null}

      <section className="neo-panel plan-detail__hero" aria-label="Resumo do plano">
        <div className="plan-detail__heroGrid">
          {heroMetrics.map((metric) => (
            <article key={metric.id} className="plan-detail__heroCard" data-tone={metric.tone ?? 'neutral'}>
              <span className="plan-detail__heroLabel">{metric.label}</span>
              <strong className="plan-detail__heroValue">{metric.value}</strong>
              {metric.hint ? <span className="plan-detail__heroHint">{metric.hint}</span> : null}
            </article>
          ))}
        </div>
      </section>

      {loadingDayData && (
        <div className="plan-detail__loading" role="status" aria-live="polite">
          <Spinner size={16} />
          <span>A atualizar dados do dia…</span>
        </div>
      )}

      <section className="neo-panel plan-detail__days" aria-label="Selecionar dia do plano">
        <div className="plan-detail__daySelector neo-segmented">
          {days.map((day) => {
            const active = day.dayIndex === dayIdx;
            const isToday = day.dayIndex === todayIdx;
            const count = day.items.length;
            return (
              <button
                key={day.dayIndex}
                type="button"
                className="neo-segmented__btn"
                data-active={active || undefined}
                data-today={isToday || undefined}
                onClick={() => handleSelectDay(day.dayIndex)}
              >
                <span className="plan-detail__dayName">{dayLabel(day.dayIndex)}</span>
                <span className="plan-detail__dayDate">{formatDateWithWeekday(day.dayIndex)}</span>
                <span className="plan-detail__dayCount">
                  {count > 0 ? `${count} exercício${count === 1 ? "" : "s"}` : "Sem exercícios"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="neo-panel plan-detail__exercises" aria-live="polite">
        <header className="plan-detail__exercisesHeader">
          <h2 className="neo-panel__title">Exercícios do dia selecionado</h2>
          <p className="neo-panel__subtitle">Expande cada exercício para registar o teu progresso.</p>
        </header>
        <div className="plan-detail__exerciseList">
          {(currentDay.items ?? []).map((item, index) => (
            <ExerciseCard
              key={`${item.id}-${dayIdx}`}
              item={item}
              index={index}
              planId={plan.id}
              dayIndex={dayIdx}
              log={exerciseLogs[item.exerciseId ?? ""]}
              disabled={loadingDayData || fallback}
              offline={fallback}
              onSaved={handleLogSaved}
            />
          ))}
          {!currentDay.items?.length && (
            <div className="neo-empty">
              <span className="neo-empty__icon" aria-hidden>
                💤
              </span>
              <p className="neo-empty__title">Sem exercícios agendados</p>
              <p className="neo-empty__description">Este dia está livre — aproveita para recuperar bem! 💪</p>
            </div>
          )}
        </div>
      </section>

      <section className="neo-panel plan-notes" aria-label="Notas do treino">
        <header className="plan-notes__header">
          <div>
            <h2 className="neo-panel__title">Notas do treino</h2>
            <p className="neo-panel__subtitle">Regista como correu o treino e adiciona uma foto da sessão.</p>
          </div>
        </header>

        {photoPath && (
          <div className="plan-notes__photo">
            <img
              src={`/api/uploads/signed?path=${encodeURIComponent(photoPath)}`}
              alt="Foto da sessão"
              loading="lazy"
            />
          </div>
        )}

        <div className="plan-notes__form">
          <label className="neo-input-group__field plan-notes__field">
            <span className="neo-input-group__label">Como te sentiste?</span>
            <textarea
              className="neo-input neo-input--textarea"
              placeholder="Alguma dificuldade? O que correu melhor?"
              value={dayNote}
              onChange={(event) => setDayNote(event.target.value)}
              rows={3}
              disabled={fallback}
            />
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              try {
                await handleUpload(file);
              } catch (err: any) {
                toast.error(err?.message || "Falha no upload");
              } finally {
                event.currentTarget.value = "";
              }
            }}
            className="plan-notes__fileInput"
            disabled={fallback}
          />
          <div className="plan-notes__buttons">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={savingNote || fallback}
            >
              📷 Anexar foto
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveDayNote}
              disabled={savingNote || fallback}
              loading={savingNote}
              loadingText="A guardar…"
            >
              Guardar nota
            </Button>
          </div>
        </div>

        {noteHistory.length > 0 && (
          <div className="plan-notes__history">
            <h3 className="plan-notes__historyTitle">Histórico recente</h3>
            <ul className="plan-notes__historyList">
              {noteHistory.map((note) => (
                <li key={note.id} className="neo-surface plan-notes__historyItem">
                  <span className="plan-notes__historyDate">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString("pt-PT") : "—"}
                  </span>
                  <p className="plan-notes__historyNote">{note.note || "Sem nota textual."}</p>
                  {note.photoPath && (
                    <a
                      href={`/api/uploads/signed?path=${encodeURIComponent(note.photoPath)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      data-variant="ghost"
                      data-size="sm"
                    >
                      Abrir foto
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

type ExerciseItem = ClientPlanDetail["days"][number]["items"][number];

function ExerciseCard({
  item,
  index,
  planId,
  dayIndex,
  log,
  disabled,
  offline,
  onSaved,
}: {
  item: ExerciseItem;
  index: number;
  planId: string;
  dayIndex: number;
  log?: NormalizedExerciseLog;
  disabled?: boolean;
  offline?: boolean;
  onSaved: (exerciseId: string, log: NormalizedExerciseLog) => void;
}) {
  const [open, setOpen] = React.useState(index === 0);
  const exercise = item.exercise;
  const media = exercise?.gifUrl || exercise?.videoUrl || null;

  return (
    <article className="neo-surface plan-exercise" data-open={open || undefined}>
      <header className="plan-exercise__header">
        <div>
          <h3 className="plan-exercise__title">{exercise?.name ?? "Exercício"}</h3>
          <p className="plan-exercise__meta">
            Séries: {item.sets ?? "-"}
            {item.reps ? ` · Reps: ${item.reps}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="plan-exercise__toggle"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <ChevronIcon />
        </button>
      </header>
      {open && (
        <div className="plan-exercise__content">
          {media && (
            <div className="plan-exercise__media">
              {exercise?.gifUrl ? (
                <img src={exercise.gifUrl} alt={exercise?.name ?? ""} loading="lazy" />
              ) : (
                <video src={exercise?.videoUrl ?? undefined} controls />
              )}
            </div>
          )}
          <SeriesEditor
            planId={planId}
            dayIndex={dayIndex}
            exerciseId={item.exerciseId}
            defaultSets={Number(item.sets ?? 3)}
            defaultReps={String(item.reps ?? "")}
            defaultRest={Number(item.restSeconds ?? 60)}
            log={log}
            disabled={disabled}
            offline={offline}
            onSaved={onSaved}
          />
          {item.notes && <p className="plan-exercise__coachNote">Nota do PT: {item.notes}</p>}
        </div>
      )}
    </article>
  );
}

function SeriesEditor({
  planId,
  dayIndex,
  exerciseId,
  defaultSets,
  defaultReps,
  defaultRest,
  log,
  disabled,
  offline,
  onSaved,
}: {
  planId: string;
  dayIndex: number;
  exerciseId: string;
  defaultSets: number;
  defaultReps: string;
  defaultRest: number;
  log?: NormalizedExerciseLog;
  disabled?: boolean;
  offline?: boolean;
  onSaved: (exerciseId: string, log: NormalizedExerciseLog) => void;
}) {
  const [sets, setSets] = React.useState<number>(Math.max(1, defaultSets));
  const [reps, setReps] = React.useState<string>(defaultReps || "");
  const [rest, setRest] = React.useState<number>(Math.max(15, defaultRest));
  const [weights, setWeights] = React.useState<string[]>(() => Array.from({ length: Math.max(1, defaultSets) }, () => ""));
  const [exerciseNote, setExerciseNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setWeights((prev) => {
      const trimmed = prev.slice(0, sets);
      while (trimmed.length < sets) trimmed.push("");
      return trimmed;
    });
  }, [sets]);

  React.useEffect(() => {
    if (log) {
      const normalizedSets = Math.max(1, log.sets || defaultSets || 1);
      setSets(normalizedSets);
      setReps(log.reps || "");
      setRest(Math.max(15, log.restSeconds || defaultRest || 15));
      setWeights(() => Array.from({ length: normalizedSets }, (_, idx) => log.weights[idx] ?? ""));
      setExerciseNote(log.note ?? "");
    } else {
      setSets(Math.max(1, defaultSets));
      setReps(defaultReps || "");
      setRest(Math.max(15, defaultRest));
      setWeights(Array.from({ length: Math.max(1, defaultSets) }, () => ""));
      setExerciseNote("");
    }
  }, [log, defaultSets, defaultReps, defaultRest]);

  async function save() {
    if (offline) {
      toast.error("Funcionalidade indisponível em modo offline.");
      return;
    }
    if (disabled) return;
    setSaving(true);
    try {
      const res = await fetch("/api/logs/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          day_index: dayIndex,
          exercise_id: exerciseId,
          sets,
          reps,
          rest_seconds: rest,
          loads: weights.map((weight, idx) => ({ set: idx + 1, weight })),
          note: exerciseNote,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Erro a guardar séries");
      if (json?.log) {
        const normalized = normalizeExerciseLog(json.log);
        if (normalized) {
          onSaved(exerciseId, normalized);
        }
      }
      toast.success("Séries guardadas");
    } catch (e: any) {
      toast.error(e?.message || "Erro a guardar séries");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="plan-series">
      <div className="plan-series__grid">
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Séries</span>
          <input
            type="number"
            className="neo-input"
            value={sets}
            min={1}
            onChange={(event) => setSets(Math.max(1, Number(event.target.value) || 1))}
            disabled={disabled || saving}
          />
        </label>
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Reps</span>
          <input
            className="neo-input"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            disabled={disabled || saving}
          />
        </label>
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Descanso (s)</span>
          <input
            type="number"
            className="neo-input"
            value={rest}
            min={15}
            onChange={(event) => setRest(Math.max(15, Number(event.target.value) || 15))}
            disabled={disabled || saving}
          />
        </label>
      </div>
      <div className="plan-series__weights">
        {Array.from({ length: sets }, (_, idx) => (
          <label key={idx} className="neo-input-group__field">
            <span className="neo-input-group__label">Carga série {idx + 1} (kg)</span>
            <input
              className="neo-input"
              value={weights[idx] ?? ""}
              onChange={(event) =>
                setWeights((arr) => {
                  const next = arr.slice();
                  next[idx] = event.target.value;
                  return next;
                })
              }
              disabled={disabled || saving}
            />
          </label>
        ))}
      </div>
      <label className="neo-input-group__field">
        <span className="neo-input-group__label">Notas do exercício</span>
        <textarea
          className="neo-input neo-input--textarea"
          value={exerciseNote}
          onChange={(event) => setExerciseNote(event.target.value)}
          rows={2}
          disabled={disabled || saving}
        />
      </label>
      <div className="plan-series__actions">
        <Button onClick={save} disabled={saving || disabled} loading={saving} loadingText="A guardar…" size="sm">
          Guardar séries
        </Button>
      </div>
      {log?.createdAt && (
        <span className="plan-series__hint">
          Último registo: {new Date(log.createdAt).toLocaleString("pt-PT")}
        </span>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="plan-exercise__chevron"
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden
    >
      <path
        d="M4 6.5L8 10.5L12 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeExerciseLog(row: any): NormalizedExerciseLog | null {
  if (!row?.exercise_id) return null;
  const payload = Array.isArray(row?.payload) ? row.payload : [];
  const weights = payload
    .map((entry: any) => (entry?.weight != null ? String(entry.weight) : ""))
    .filter((_, idx) => idx < 12);
  const sets = Number.isFinite(Number(row?.sets)) ? Number(row.sets) : 0;
  const normalizedSets = Math.max(sets, weights.length, 0);
  const filledWeights = Array.from({ length: normalizedSets || 0 }, (_, idx) => weights[idx] ?? "");
  return {
    id: row?.id ?? `${row.exercise_id}-${row.created_at ?? ""}`,
    exerciseId: String(row.exercise_id),
    sets,
    reps: row?.reps != null ? String(row.reps) : "",
    restSeconds: Number.isFinite(Number(row?.rest_seconds)) ? Number(row.rest_seconds) : 0,
    weights: filledWeights,
    note: row?.note != null ? String(row.note) : null,
    createdAt: row?.created_at ?? null,
  };
}

function normalizeNote(row: any): WorkoutNote {
  return {
    id: row?.id ?? `${row?.plan_id ?? "note"}-${row?.created_at ?? Math.random()}`,
    note: row?.note != null ? String(row.note) : null,
    photoPath: row?.photo_path ? String(row.photo_path) : null,
    createdAt: row?.created_at ?? null,
  };
}
