"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import DataSourceBadge from "@/components/ui/DataSourceBadge";

type JsonLike = unknown;

type FormRow = {
  id?: string;
  user_id?: string;
  status?: "draft" | "submitted" | null;
  goals?: JsonLike;
  injuries?: JsonLike;
  medical?: JsonLike;
  activity_level?: string | null;
  experience?: string | null;
  availability?: JsonLike;
  created_at?: string | null;
  updated_at?: string | null;
  profiles?: { name?: string | null } | null;
  users?: { email?: string | null } | null;
};

type Note = {
  id: string;
  visibility: "private" | "shared";
  content: string;
  created_at: string;
  author_id?: string | null;
  profiles?: { name?: string | null } | null;
};

type Props = {
  form: FormRow | null;
  notes: Note[];
  viewerName?: string | null;
};

type Feedback = { tone: "success" | "danger" | "info"; message: string };

type Visibility = "private" | "shared";

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  {
    value: "private",
    label: "Privada (Admin/PT)",
    description: "Visível apenas para administradores e equipa técnica.",
  },
  {
    value: "shared",
    label: "Partilhada (visível ao cliente)",
    description: "Notifica o cliente e fica acessível no painel pessoal.",
  },
];

const STATUS_META: Record<"draft" | "submitted", { label: string; tone: "warn" | "ok"; hint: string }> = {
  draft: {
    label: "Rascunho",
    tone: "warn",
    hint: "Aguardamos que o cliente finalize o formulário.",
  },
  submitted: {
    label: "Submetido",
    tone: "ok",
    hint: "Dados finalizados pelo cliente – prontos para prescrição.",
  },
};

const RISK_KEYWORDS = ["dor", "les", "cirurg", "cardi", "asma", "press", "fract"];

function toText(value: JsonLike): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        typeof entry === "string" ? entry : entry && typeof entry === "object" ? JSON.stringify(entry) : String(entry),
      )
      .join(", ");
  }
  if (typeof value === "object") {
    try {
      const values = Object.values(value as Record<string, unknown>);
      if (values.every((entry) => typeof entry === "string")) {
        return values.join(", ");
      }
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatRelative(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    const diff = date.getTime() - Date.now();
    if (!Number.isFinite(diff)) return null;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const rtf = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });
    if (Math.abs(diff) < hour) return rtf.format(Math.round(diff / minute), "minute");
    if (Math.abs(diff) < day) return rtf.format(Math.round(diff / hour), "hour");
    if (Math.abs(diff) < 30 * day) return rtf.format(Math.round(diff / day), "day");
    return rtf.format(Math.round(diff / (30 * day)), "month");
  } catch {
    return null;
  }
}

function computeRiskScore(injuries: string, medical: string) {
  const combined = `${injuries} ${medical}`.toLowerCase();
  if (!combined.trim()) {
    return { label: "Baixo", tone: "success" as const, hint: "Sem registos de lesões ou condições sensíveis." };
  }
  if (RISK_KEYWORDS.some((keyword) => combined.includes(keyword))) {
    return {
      label: "Elevado",
      tone: "danger" as const,
      hint: "Rever com atenção antes de planear cargas intensas.",
    };
  }
  return {
    label: "Moderado",
    tone: "warning" as const,
    hint: "Existem apontamentos a validar com o cliente/PT.",
  };
}

function completionChecklist(form: FormRow | null) {
  const fields = [
    toText(form?.goals),
    toText(form?.injuries),
    toText(form?.medical),
    form?.activity_level ?? "",
    form?.experience ?? "",
    toText(form?.availability),
  ];
  const total = fields.length;
  const filled = fields.filter((value) => Boolean(value && String(value).trim())).length;
  const percent = total === 0 ? 0 : Math.round((filled / total) * 100);
  return { total, filled, percent };
}

export default function AdminOnboardingReviewClient({ form, notes, viewerName }: Props) {
  const router = useRouter();
  const [visibility, setVisibility] = React.useState<Visibility>("private");
  const [content, setContent] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | Visibility>("all");
  const [items, setItems] = React.useState<Note[]>(notes);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [busy, setBusy] = React.useState(false);
  const feedbackId = React.useId();

  const clientName = form?.profiles?.name ?? form?.users?.email ?? form?.user_id ?? "—";
  const status = (form?.status === "submitted" ? "submitted" : "draft") as "draft" | "submitted";
  const statusMeta = STATUS_META[status];
  const updatedLabel = formatDate(form?.updated_at ?? form?.created_at);
  const updatedRelative = formatRelative(form?.updated_at ?? form?.created_at);
  const injuriesText = toText(form?.injuries);
  const medicalText = toText(form?.medical);
  const risk = computeRiskScore(injuriesText, medicalText);
  const progress = completionChecklist(form);

  const filteredNotes = React.useMemo(() => {
    if (filter === "all") return items;
    return items.filter((note) => note.visibility === filter);
  }, [filter, items]);

  async function addNote() {
    if (!form?.id) {
      setFeedback({ tone: "danger", message: "Formulário inexistente ou sem identificação." });
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) {
      setFeedback({ tone: "danger", message: "Escreve uma nota antes de guardar." });
      return;
    }
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/onboarding/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_id: form.id, visibility, content: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Falha ao guardar a nota.");
      }
      const localNote: Note = {
        id: crypto.randomUUID(),
        visibility,
        content: trimmed,
        created_at: new Date().toISOString(),
        profiles: { name: viewerName ?? "Tu" },
      };
      setItems((prev) => [localNote, ...prev]);
      setContent("");
      setFeedback({ tone: "success", message: "Nota registada com sucesso." });
      router.refresh();
    } catch (error: any) {
      console.error("[admin-onboarding] addNote failed", error);
      setFeedback({ tone: "danger", message: error?.message ?? "Erro inesperado ao guardar a nota." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-onboarding neo-stack neo-stack--xl" aria-describedby={feedback ? feedbackId : undefined}>
      <header className="neo-panel neo-panel--header admin-onboarding__hero">
        <div className="admin-onboarding__heroLeft">
          <span className="caps-tag">Onboarding do cliente</span>
          <h1 className="heading-solid">{clientName}</h1>
          <p className="neo-text--sm neo-text--muted">
            Avalia objectivos, historial clínico e disponibilidade para planear o acompanhamento personalizado. {viewerName ? `Registado por ${viewerName}.` : null}
          </p>
        </div>
        <div className="admin-onboarding__heroRight">
          <span className="status-pill" data-state={statusMeta.tone}>{statusMeta.label}</span>
          <DataSourceBadge source="supabase" generatedAt={form?.updated_at ?? form?.created_at ?? undefined} />
          <p className="neo-text--xs neo-text--muted">{statusMeta.hint}</p>
        </div>
      </header>

      <div className="admin-onboarding__layout">
        <aside className="neo-panel admin-onboarding__summary" aria-labelledby="admin-onboarding-summary">
          <div className="neo-stack neo-stack--sm">
            <h2 id="admin-onboarding-summary" className="admin-onboarding__summaryTitle">
              Resumo operacional
            </h2>
            <p className="neo-text--xs neo-text--muted">
              Última actualização {updatedLabel}{updatedRelative ? ` (${updatedRelative})` : ''}.
            </p>
          </div>
          <div className="admin-onboarding__progress" role="img" aria-label={`Preenchido ${progress.filled} de ${progress.total} campos`}>
            <div className="admin-onboarding__progressBar">
              <span style={{ width: `${progress.percent}%` }} aria-hidden="true" />
            </div>
            <div className="admin-onboarding__progressMeta">
              <span>{progress.percent}% completo</span>
              <span>
                {progress.filled}/{progress.total} campos
              </span>
            </div>
          </div>
          <dl className="admin-onboarding__metrics">
            <div className="neo-surface neo-surface--compact" data-variant={risk.tone}>
              <dt className="neo-text--xs neo-text--muted">Risco reportado</dt>
              <dd className="admin-onboarding__metricValue">{risk.label}</dd>
              <span className="neo-text--xs neo-text--muted">{risk.hint}</span>
            </div>
            <div className="neo-surface neo-surface--compact" data-variant="teal">
              <dt className="neo-text--xs neo-text--muted">Nível de actividade</dt>
              <dd className="admin-onboarding__metricValue">{form?.activity_level ?? '—'}</dd>
              <span className="neo-text--xs neo-text--muted">Experiência: {form?.experience ?? '—'}</span>
            </div>
            <div className="neo-surface neo-surface--compact" data-variant="purple">
              <dt className="neo-text--xs neo-text--muted">Notas registadas</dt>
              <dd className="admin-onboarding__metricValue">{items.length}</dd>
              <span className="neo-text--xs neo-text--muted">Inclui histórico privado e partilhado.</span>
            </div>
          </dl>
        </aside>

        <div className="admin-onboarding__content neo-stack neo-stack--xl">
          <section className="neo-panel admin-onboarding__details" aria-labelledby="admin-onboarding-details">
            <div className="neo-stack neo-stack--sm">
              <h2 id="admin-onboarding-details" className="admin-onboarding__sectionTitle">
                Dados fornecidos pelo cliente
              </h2>
              <p className="neo-text--xs neo-text--muted">Informação declarada pelo cliente durante o onboarding.</p>
            </div>
            <dl className="admin-onboarding__detailsList">
              <div>
                <dt>Objetivos</dt>
                <dd>{toText(form?.goals) || '—'}</dd>
              </div>
              <div>
                <dt>Lesões ou limitações</dt>
                <dd>{injuriesText || '—'}</dd>
              </div>
              <div>
                <dt>Condições médicas</dt>
                <dd>{medicalText || '—'}</dd>
              </div>
              <div>
                <dt>Disponibilidade semanal</dt>
                <dd>{toText(form?.availability) || '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="neo-panel admin-onboarding__notes" aria-labelledby="admin-onboarding-notes">
            <div className="neo-inline neo-inline--between neo-inline--wrap">
              <div className="neo-stack neo-stack--xs">
                <h2 id="admin-onboarding-notes" className="admin-onboarding__sectionTitle">
                  Notas e acompanhamento
                </h2>
                <p className="neo-text--xs neo-text--muted">
                  Regista insights privados ou notas partilhadas com o cliente. Filtros aplicados: {filter === 'all' ? 'todos os registos' : filter === 'private' ? 'apenas privados' : 'partilhados com o cliente'}.
                </p>
              </div>
              <div className="admin-onboarding__filter">
                <label className="neo-input-group__field">
                  <span className="neo-input-group__label">Filtrar notas</span>
                  <select className="neo-input" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
                    <option value="all">Todas</option>
                    <option value="private">Privadas</option>
                    <option value="shared">Partilhadas</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="admin-onboarding__composer">
              <div className="neo-input-group admin-onboarding__composerVisibility">
                <label className="neo-input-group__field">
                  <span className="neo-input-group__label">Visibilidade</span>
                  <select
                    className="neo-input"
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value as Visibility)}
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="neo-input-group__hint">
                    {VISIBILITY_OPTIONS.find((option) => option.value === visibility)?.description}
                  </span>
                </label>
              </div>
              <div className="neo-input-group admin-onboarding__composerField">
                <label className="neo-input-group__field">
                  <span className="neo-input-group__label">Adicionar nota</span>
                  <textarea
                    className="neo-input neo-input--textarea"
                    rows={3}
                    value={content}
                    maxLength={2000}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Ex.: Ajustar volume de agachamentos devido a desconforto no joelho esquerdo."
                  />
                  <span className="neo-input-group__hint">Máximo 2000 caracteres.</span>
                </label>
              </div>
              <Button
                type="button"
                variant="primary"
                loading={busy}
                onClick={addNote}
                disabled={!content.trim()}
              >
                Guardar nota
              </Button>
            </div>

            <div className="admin-onboarding__notesList" role="region" aria-live="polite">
              {filteredNotes.length === 0 ? (
                <div className="neo-empty">
                  <span className="neo-empty__icon" aria-hidden="true">
                    🗒️
                  </span>
                  <p className="neo-empty__title">Sem notas neste filtro</p>
                  <p className="neo-empty__description">Regista uma nota ou altera o filtro para ver o histórico completo.</p>
                </div>
              ) : (
                <ul className="admin-onboarding__timeline">
                  {filteredNotes.map((note) => (
                    <li key={note.id} className="admin-onboarding__timelineItem">
                      <div className="admin-onboarding__timelineMeta">
                        <span className="admin-onboarding__badge" data-variant={note.visibility === 'private' ? 'neutral' : 'success'}>
                          {note.visibility === 'private' ? 'Privada' : 'Partilhada'}
                        </span>
                        <span className="neo-text--xs neo-text--muted">
                          {formatDate(note.created_at)}
                          {note.profiles?.name ? ` • ${note.profiles.name}` : ''}
                        </span>
                      </div>
                      <p className="admin-onboarding__timelineContent">{note.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-onboarding__feedback" id={feedbackId} aria-live="polite">
              {feedback ? (
                <div className="neo-alert" data-tone={feedback.tone}>
                  <div className="neo-alert__content">
                    <p className="neo-alert__message">{feedback.message}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
