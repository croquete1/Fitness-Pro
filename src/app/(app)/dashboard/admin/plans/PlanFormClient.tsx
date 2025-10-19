"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const PlanExercisesEditor = React.lazy(() => import("./PlanExercisesEditor"));

export type PlanValues = {
  id?: string;
  name: string;
  description?: string;
  difficulty?: 'Fácil' | 'Média' | 'Difícil';
  duration_weeks?: number | null;
  is_public?: boolean;
};

export function mapRow(r: any): PlanValues {
  return {
    id: String(r.id),
    name: (r.name ?? r.title ?? '') as string,
    description: (r.description ?? r.details ?? '') as string,
    difficulty: (r.difficulty ?? r.level ?? '') || undefined,
    duration_weeks: (r.duration_weeks ?? r.duration ?? null) as number | null,
    is_public: Boolean(r.is_public ?? r.public ?? false),
  };
}

// Zod compatível com versões antigas (sem required_error)
const Diff = z.union([z.literal("Fácil"), z.literal("Média"), z.literal("Difícil")]);
const PlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório").min(2, "Nome muito curto"),
  description: z.string().optional(),
  difficulty: Diff.optional(),
  duration_weeks: z.coerce.number().int().positive().max(104).optional().nullable(),
  is_public: z.boolean().optional(),
});

export default function PlanFormClient({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<PlanValues>;
}) {
  const router = useRouter();

  const [values, setValues] = React.useState<PlanValues>(() => ({
    id: initial?.id,
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    difficulty: (initial?.difficulty as any) ?? undefined,
    duration_weeks: initial?.duration_weeks ?? null,
    is_public: Boolean(initial?.is_public ?? false),
  }));

  const [errors, setErrors] = React.useState<Partial<Record<keyof PlanValues, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    tone: "success" | "danger" | "warning" | "info";
    message: string;
  } | null>(null);

  const headingId = React.useId();

  function setField<K extends keyof PlanValues>(k: K, v: PlanValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    setErrors({});

    const parsed = PlanSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof PlanValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const p = issue.path[0] as keyof PlanValues | undefined;
        if (p) fieldErrors[p] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      setFeedback({ tone: "danger", message: "Verifica os campos destacados." });
      return;
    }

    const payload = parsed.data;

    try {
      let res: Response;
      if (mode === "edit" && payload.id) {
        res = await fetch(`/api/admin/plans/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error((await res.text()) || "Falha ao gravar");

      router.push("/dashboard/admin/plans");
    } catch (e: any) {
      setFeedback({ tone: "danger", message: e?.message || "Falha ao gravar plano." });
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), feedback.tone === "success" ? 4000 : 6000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  return (
    <div className="admin-plan-form">
      <form
        className="neo-panel admin-plan-form__panel"
        aria-labelledby={headingId}
        onSubmit={onSubmit}
        noValidate
      >
        <header className="neo-panel__header">
          <div>
            <h1 id={headingId} className="neo-panel__title">
              {mode === "edit" ? "Editar plano" : "Novo plano"}
            </h1>
            <p className="neo-panel__subtitle">
              Define os detalhes operacionais do plano de treino.
            </p>
          </div>
        </header>

        <div className="neo-panel__body admin-plan-form__body">
          {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

          <div className="admin-plan-form__grid">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Nome</span>
              <input
                value={values.name}
                onChange={(event) => setField("name", event.target.value)}
                className="neo-input"
                type="text"
                placeholder="Plano de hipertrofia 12 semanas"
                autoComplete="off"
                required
              />
              {errors.name ? (
                <span className="neo-input-group__hint" data-tone="error">
                  {errors.name}
                </span>
              ) : (
                <span className="neo-input-group__hint">Título visível para administradores e PTs.</span>
              )}
            </label>

            <label className="neo-input-group__field admin-plan-form__description">
              <span className="neo-input-group__label">Descrição</span>
              <textarea
                value={values.description ?? ""}
                onChange={(event) => setField("description", event.target.value)}
                className="neo-input"
                rows={4}
                placeholder="Resumo do objectivo, frequência semanal e notas principais."
              />
              {errors.description ? (
                <span className="neo-input-group__hint" data-tone="error">
                  {errors.description}
                </span>
              ) : (
                <span className="neo-input-group__hint">Opcional — apresentado em listagens e relatórios.</span>
              )}
            </label>

            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Dificuldade</span>
              <select
                value={values.difficulty ?? ""}
                onChange={(event) =>
                  setField("difficulty", (event.target.value || undefined) as PlanValues["difficulty"]) }
                className="neo-input"
              >
                <option value="">Selecione</option>
                <option value="Fácil">Fácil</option>
                <option value="Média">Média</option>
                <option value="Difícil">Difícil</option>
              </select>
              {errors.difficulty ? (
                <span className="neo-input-group__hint" data-tone="error">
                  {errors.difficulty}
                </span>
              ) : (
                <span className="neo-input-group__hint">Ajuda a segmentar planos por nível de experiência.</span>
              )}
            </label>

            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Duração (semanas)</span>
              <input
                value={values.duration_weeks ?? ""}
                onChange={(event) =>
                  setField(
                    "duration_weeks",
                    event.target.value === "" ? null : Number(event.target.value),
                  )
                }
                className="neo-input"
                type="number"
                min={1}
                max={104}
                inputMode="numeric"
                placeholder="12"
              />
              {errors.duration_weeks ? (
                <span className="neo-input-group__hint" data-tone="error">
                  {errors.duration_weeks}
                </span>
              ) : (
                <span className="neo-input-group__hint">Opcional — usado em relatórios e métricas.</span>
              )}
            </label>
          </div>

          <label className="neo-checkbox admin-plan-form__visibility">
            <input
              type="checkbox"
              checked={Boolean(values.is_public)}
              onChange={(event) => setField("is_public", event.target.checked)}
            />
            <span>
              <span className="neo-checkbox__label">Plano público</span>
              <span className="neo-checkbox__hint">Disponibiliza o plano na biblioteca partilhada.</span>
            </span>
          </label>
        </div>

        <footer className="neo-panel__footer admin-plan-form__footer">
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            loadingText={mode === "edit" ? "A actualizar…" : "A criar…"}
          >
            {mode === "edit" ? "Guardar alterações" : "Criar plano"}
          </Button>
        </footer>
      </form>

      {mode === "edit" && values.id && (
        <React.Suspense
          fallback={(
            <div className="admin-plan-form__lazyFallback" role="status" aria-live="polite">
              A carregar editor de exercícios…
            </div>
          )}
        >
          <PlanExercisesEditor planId={values.id} planName={values.name} />
        </React.Suspense>
      )}
    </div>
  );
}