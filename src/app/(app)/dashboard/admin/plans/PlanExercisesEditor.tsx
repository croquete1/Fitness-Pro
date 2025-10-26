"use client";

import * as React from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";

type Row = {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group?: string | null;
  difficulty?: string | null;
  sort: number | null;
};

type ExerciseOption = {
  id: string;
  name: string;
  muscle_group?: string | null;
  difficulty?: string | null;
};

type Feedback = { tone: "success" | "danger" | "warning" | "info"; message: string } | null;

type Props = {
  planId: string;
  planName?: string;
};

const DEFAULT_MUSCLES = [
  "Peito",
  "Costas",
  "Perna",
  "Ombros",
  "Braços",
  "Core",
  "Glúteos",
  "Abdominais",
  "Full body",
];

const DEFAULT_DIFFICULTIES = ["Fácil", "Média", "Difícil"];

function normaliseLabel(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function toFilterValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function generateOptionId(seed?: unknown) {
  if (seed != null && seed !== "") return String(seed);
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // ignora falhas do ambiente
    }
  }
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function PlanExercisesEditor({ planId, planName }: Props) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  const [filters, setFilters] = React.useState({ search: "", muscle: "all", difficulty: "all" });

  const [exerciseOptions, setExerciseOptions] = React.useState<ExerciseOption[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const [optionsError, setOptionsError] = React.useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = React.useState("");

  const [action, setAction] = React.useState<{ type: "add" | "remove" | "reorder"; id?: string } | null>(null);

  const filteredRows = React.useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const muscleFilter = filters.muscle.toLowerCase();
    const difficultyFilter = filters.difficulty.toLowerCase();

    return [...rows]
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .filter((row) => {
        if (searchTerm && !row.name.toLowerCase().includes(searchTerm)) return false;
        if (muscleFilter !== "all" && toFilterValue(row.muscle_group) !== muscleFilter) return false;
        if (difficultyFilter !== "all" && toFilterValue(row.difficulty) !== difficultyFilter) return false;
        return true;
      });
  }, [rows, filters]);

  const muscleOptions = React.useMemo(() => {
    const set = new Set<string>();
    DEFAULT_MUSCLES.forEach((label) => set.add(label));
    rows.forEach((row) => {
      const label = normaliseLabel(row.muscle_group);
      if (label) set.add(label);
    });
    exerciseOptions.forEach((option) => {
      const label = normaliseLabel(option.muscle_group);
      if (label) set.add(label);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows, exerciseOptions]);

  const difficultyOptions = React.useMemo(() => {
    const set = new Set<string>();
    DEFAULT_DIFFICULTIES.forEach((label) => set.add(label));
    rows.forEach((row) => {
      const label = normaliseLabel(row.difficulty);
      if (label) set.add(label);
    });
    exerciseOptions.forEach((option) => {
      const label = normaliseLabel(option.difficulty);
      if (label) set.add(label);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows, exerciseOptions]);

  const difficultyDistribution = React.useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const label = normaliseLabel(row.difficulty) || "Indefinido";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const uniqueMuscles = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      const label = normaliseLabel(row.muscle_group);
      if (label) set.add(label);
    });
    return set.size;
  }, [rows]);

  const manualOrder = React.useMemo(() => {
    return rows.some((row, index) => (row.sort ?? index) !== index);
  }, [rows]);

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), feedback.tone === "success" ? 3500 : 6000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const loadList = React.useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch(`/api/admin/plans/${planId}/exercises`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await response.text().catch(() => "Falha ao carregar exercícios do plano."));
      }
      const json = await response.json();
      const mapped: Row[] = Array.isArray(json?.rows)
        ? json.rows.map((item: any, index: number) => ({
            id: String(item?.id ?? `${item?.exercise_id ?? index}`),
            exercise_id: String(item?.exercise_id ?? item?.id ?? index),
            name: String(item?.name ?? item?.exercise_name ?? `Exercício ${index + 1}`),
            muscle_group: item?.muscle_group ?? item?.muscle ?? null,
            difficulty: item?.difficulty ?? item?.level ?? null,
            sort: typeof item?.sort === "number" ? item.sort : index,
          }))
        : [];
      mapped.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      setRows(mapped);
    } catch (error: any) {
      console.warn("[admin/plans] failed to load exercises", error);
      setRows([]);
      setListError(error?.message || "Falha ao carregar exercícios do plano.");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const loadExerciseOptions = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const url = new URL("/api/admin/exercises", window.location.origin);
      url.searchParams.set("page", "0");
      url.searchParams.set("pageSize", "50");
      if (filters.search.trim()) url.searchParams.set("q", filters.search.trim());
      if (filters.muscle !== "all") url.searchParams.set("muscle_group", filters.muscle);
      if (filters.difficulty !== "all") url.searchParams.set("difficulty", filters.difficulty);
      const response = await fetch(url.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error(await response.text().catch(() => "Falha ao carregar exercícios disponíveis."));
      const json = await response.json();
      const mapped: ExerciseOption[] = Array.isArray(json?.rows)
        ? json.rows.map((item: any) => ({
            id: generateOptionId(item?.id ?? item?.exercise_id),
            name: String(item?.name ?? `Exercício ${item?.id ?? ""}`),
            muscle_group: item?.muscle_group ?? item?.muscle ?? null,
            difficulty: item?.difficulty ?? item?.level ?? null,
          }))
        : [];
      setExerciseOptions(mapped);
    } catch (error: any) {
      console.warn("[admin/plans] failed to load exercise options", error);
      setOptionsError(error?.message || "Falha ao carregar exercícios disponíveis.");
      setExerciseOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }, [filters.search, filters.muscle, filters.difficulty]);

  React.useEffect(() => {
    void loadList();
  }, [loadList]);

  React.useEffect(() => {
    void loadExerciseOptions();
  }, [loadExerciseOptions]);

  React.useEffect(() => {
    if (!selectedExerciseId) return;
    if (!exerciseOptions.some((option) => option.id === selectedExerciseId)) {
      setSelectedExerciseId("");
    }
  }, [exerciseOptions, selectedExerciseId]);

  const adding = action?.type === "add";
  const removingId = action?.type === "remove" ? action.id : null;
  const reordering = action?.type === "reorder";

  async function addExercise() {
    if (!selectedExerciseId) return;
    setAction({ type: "add" });
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/plans/${planId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ exercise_id: selectedExerciseId }] }),
      });
      if (!response.ok) throw new Error(await response.text().catch(() => "Falha ao adicionar exercício."));
      setSelectedExerciseId("");
      setFeedback({ tone: "success", message: "Exercício adicionado ao plano." });
      await loadList();
      await loadExerciseOptions();
    } catch (error: any) {
      console.warn("[admin/plans] add exercise failed", error);
      setFeedback({ tone: "danger", message: error?.message || "Falha ao adicionar exercício." });
    } finally {
      setAction(null);
    }
  }

  async function removeExercise(exerciseId: string) {
    setAction({ type: "remove", id: exerciseId });
    setFeedback(null);
    try {
      if (typeof window === "undefined") throw new Error("Janela indisponível");
      const url = new URL(`/api/admin/plans/${planId}/exercises`, window.location.origin);
      url.searchParams.set("exercise_id", exerciseId);
      const response = await fetch(url.toString(), { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text().catch(() => "Falha ao remover exercício."));
      setRows((prev) => prev.filter((row) => row.exercise_id !== exerciseId));
      setFeedback({ tone: "success", message: "Exercício removido do plano." });
      await loadExerciseOptions();
    } catch (error: any) {
      console.warn("[admin/plans] remove exercise failed", error);
      setFeedback({ tone: "danger", message: error?.message || "Falha ao remover exercício." });
    } finally {
      setAction(null);
    }
  }

  async function reorder(index: number, direction: -1 | 1) {
    const ordered = [...rows].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    setAction({ type: "reorder" });
    setFeedback(null);

    const swapped = [...ordered];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const reindexed = swapped.map((row, position) => ({ ...row, sort: position }));
    setRows(reindexed);

    try {
      const response = await fetch(`/api/admin/plans/${planId}/exercises`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reindexed.map((row) => ({ id: row.id, sort: row.sort })) }),
      });
      if (!response.ok) throw new Error(await response.text().catch(() => "Falha ao reordenar exercícios."));
      setFeedback({ tone: "info", message: "Ordem actualizada." });
    } catch (error: any) {
      console.warn("[admin/plans] reorder exercises failed", error);
      setFeedback({ tone: "danger", message: error?.message || "Falha ao reordenar exercícios." });
      await loadList();
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="neo-panel admin-plan-exercises">
      <header className="neo-panel__header admin-plan-exercises__header">
        <div>
          <h2 className="neo-panel__title">Exercícios do plano</h2>
          <p className="neo-panel__subtitle">
            {planName ? `Gestão do plano “${planName}”.` : "Sincronizado com o servidor em tempo real."}
          </p>
        </div>
        <div className="admin-plan-exercises__actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} aria-hidden />}
            onClick={() => {
              void loadList();
              void loadExerciseOptions();
            }}
            disabled={loading || reordering}
          >
            Atualizar
          </Button>
        </div>
      </header>

      <div className="neo-panel__body admin-plan-exercises__body">
        <div className="admin-plan-exercises__metrics">
          <div className="admin-plan-exercises__metric">
            <span className="admin-plan-exercises__metricLabel">Exercícios</span>
            <span className="admin-plan-exercises__metricValue">{rows.length}</span>
            <span className="admin-plan-exercises__metricHint">Ligados actualmente ao plano.</span>
          </div>
          <div className="admin-plan-exercises__metric">
            <span className="admin-plan-exercises__metricLabel">Grupos musculares</span>
            <span className="admin-plan-exercises__metricValue">{uniqueMuscles}</span>
            <span className="admin-plan-exercises__metricHint">Cobertura distinta por grupo muscular.</span>
          </div>
          <div className="admin-plan-exercises__metric" data-state={manualOrder ? "custom" : "sequential"}>
            <span className="admin-plan-exercises__metricLabel">Ordenação</span>
            <span className="admin-plan-exercises__metricValue">
              {manualOrder ? "Personalizada" : "Sequencial"}
            </span>
            <span className="admin-plan-exercises__metricHint">Actualizado ao reordenar exercícios.</span>
          </div>
        </div>

        {feedback && <Alert className="admin-plan-exercises__feedback" tone={feedback.tone}>{feedback.message}</Alert>}
        {listError && <Alert className="admin-plan-exercises__feedback" tone="danger">{listError}</Alert>}

        <div className="admin-plan-exercises__filters">
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Pesquisar</span>
            <input
              className="neo-input"
              type="search"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Ex.: remada, agachamento, alongar"
              autoComplete="off"
            />
          </label>

          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Músculo</span>
            <select
              className="neo-input"
              value={filters.muscle}
              onChange={(event) => setFilters((prev) => ({ ...prev, muscle: event.target.value }))}
            >
              {muscleOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Todos" : option}
                </option>
              ))}
            </select>
          </label>

          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Dificuldade</span>
            <select
              className="neo-input"
              value={filters.difficulty}
              onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value }))}
            >
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Todas" : option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-plan-exercises__adder">
          <label className="neo-input-group__field admin-plan-exercises__adderField">
            <span className="neo-input-group__label">Adicionar exercício</span>
            <select
              className="neo-input"
              value={selectedExerciseId}
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              disabled={optionsLoading || optionsError !== null || loading}
            >
              <option value="">
                {optionsLoading ? "A carregar opções…" : "Selecciona um exercício sugerido"}
              </option>
              {exerciseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.muscle_group ? ` · ${normaliseLabel(option.muscle_group)}` : ""}
                </option>
              ))}
            </select>
            {optionsError ? (
              <span className="neo-input-group__hint" data-tone="error">{optionsError}</span>
            ) : (
              <span className="neo-input-group__hint">Sugestões limitadas aos filtros activos.</span>
            )}
          </label>

          <Button
            type="button"
            size="sm"
            leftIcon={<Plus size={14} aria-hidden />}
            onClick={() => void addExercise()}
            disabled={!selectedExerciseId || adding}
            loading={adding}
            loadingText="A adicionar…"
          >
            Adicionar ao plano
          </Button>
        </div>

        <div className="admin-plan-exercises__distribution">
          <h3>Distribuição por dificuldade</h3>
          {difficultyDistribution.length === 0 ? (
            <p className="admin-plan-exercises__distributionEmpty">Sem dados para apresentar.</p>
          ) : (
            <ul>
              {difficultyDistribution.map(([label, count]) => (
                <li key={label}>
                  <span>{label}</span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={clsx("neo-table-wrapper", (loading || reordering) && "is-loading")}
          role="region"
          aria-live="polite"
        >
          <table className="neo-table admin-plan-exercises__table">
            <thead>
              <tr>
                <th scope="col">Ordem</th>
                <th scope="col">Exercício</th>
                <th scope="col">Músculo</th>
                <th scope="col">Dificuldade</th>
                <th scope="col" className="neo-table__actions">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={`${row.id}-${row.exercise_id}`}>
                  <td data-title="Ordem" className="neo-table__cell--right">
                    {(row.sort ?? index) + 1}
                  </td>
                  <td data-title="Exercício">
                    <div className="admin-plan-exercises__name">
                      <span className="admin-plan-exercises__nameText">{row.name}</span>
                      {row.muscle_group && (
                        <span className="admin-plan-exercises__muscle">{normaliseLabel(row.muscle_group)}</span>
                      )}
                    </div>
                  </td>
                  <td data-title="Músculo">{normaliseLabel(row.muscle_group) || "—"}</td>
                  <td data-title="Dificuldade">{normaliseLabel(row.difficulty) || "—"}</td>
                  <td data-title="Ações" className="neo-table__actions">
                    <div className="admin-plan-exercises__rowActions">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<ArrowUp size={14} aria-hidden />}
                        onClick={() => void reorder(index, -1)}
                        disabled={reordering || loading || index === 0}
                      >
                        <span className="sr-only">Subir</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<ArrowDown size={14} aria-hidden />}
                        onClick={() => void reorder(index, 1)}
                        disabled={reordering || loading || index === filteredRows.length - 1}
                      >
                        <span className="sr-only">Descer</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 size={14} aria-hidden />}
                        onClick={() => void removeExercise(row.exercise_id)}
                        disabled={reordering || loading || removingId === row.exercise_id}
                        loading={removingId === row.exercise_id}
                        loadingText="A remover…"
                      >
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="neo-table__loading" role="status">
              <Spinner size={16} /> A carregar exercícios…
            </div>
          )}

          {!loading && filteredRows.length === 0 && (
            <div className="neo-table-empty">
              <p className="neo-table-empty__title">Sem exercícios correspondentes.</p>
              <p className="neo-table-empty__description">
                Ajusta os filtros ou adiciona novos exercícios ao plano.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
