"use client";

import * as React from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const PACKAGE_STATUSES = ["ACTIVE", "PAUSED", "ENDED"] as const;
type PackageStatus = (typeof PACKAGE_STATUSES)[number];

type ExistingPackage = {
  id: string;
  client_id?: string | null;
  title?: string | null;
  sessions_included?: number | null;
  sessions_used?: number | null;
  price_cents?: number | null;
  currency?: string | null;
  status?: string | null;
  notes?: string | null;
};

type FormState = {
  clientId: string;
  title: string;
  sessionsIncluded: string;
  sessionsUsed: string;
  priceCents: string;
  currency: string;
  status: PackageStatus;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const DEFAULT_FORM: FormState = {
  clientId: "",
  title: "",
  sessionsIncluded: "10",
  sessionsUsed: "0",
  priceCents: "0",
  currency: "EUR",
  status: "ACTIVE",
  notes: "",
};

function normalizeExisting(existing?: ExistingPackage | null): FormState {
  if (!existing) return DEFAULT_FORM;
  return {
    clientId: existing.client_id ?? "",
    title: existing.title ?? "",
    sessionsIncluded: existing.sessions_included != null ? String(existing.sessions_included) : "10",
    sessionsUsed: existing.sessions_used != null ? String(existing.sessions_used) : "0",
    priceCents: existing.price_cents != null ? String(existing.price_cents) : "0",
    currency: existing.currency ?? "EUR",
    status: (PACKAGE_STATUSES.find((status) => status === existing.status) ?? "ACTIVE") as PackageStatus,
    notes: existing.notes ?? "",
  };
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...props}>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fieldErrorMessage(key: keyof FormState, value: string) {
  const trimmed = value.trim();
  switch (key) {
    case "clientId":
      return trimmed ? null : "Indica o identificador do cliente.";
    case "title":
      return trimmed ? null : "O pacote precisa de um título.";
    case "sessionsIncluded": {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return "Sessões incluídas deve ser um número positivo.";
      }
      return null;
    }
    case "sessionsUsed": {
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return "Sessões usadas deve ser um número igual ou superior a zero.";
      }
      return null;
    }
    case "priceCents": {
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return "O preço tem de ser um número positivo.";
      }
      return null;
    }
    case "currency":
      return trimmed.length >= 3 ? null : "Indica o código da moeda (ex.: EUR).";
    case "status":
      return PACKAGE_STATUSES.includes(value as PackageStatus) ? null : "Estado inválido.";
    case "notes":
      return value.length > 1024 ? "Limita as notas a 1024 caracteres." : null;
    default:
      return null;
  }
}

async function submitPackage(existing: ExistingPackage | undefined, payload: Record<string, unknown>) {
  const endpoint = existing ? `/api/clients/packages/${existing.id}` : "/api/clients/packages";
  const method = existing ? "PATCH" : "POST";
  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof json?.message === "string" ? json.message : "Não foi possível guardar o pacote.";
    throw new Error(message);
  }
  return json;
}

async function deletePackage(existing: ExistingPackage) {
  const response = await fetch(`/api/clients/packages/${existing.id}`, { method: "DELETE" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Não foi possível remover o pacote.");
    throw new Error(message);
  }
}

export default function ClientPackageModal({ existing }: { existing?: ExistingPackage }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(() => normalizeExisting(existing));
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [message, setMessage] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const firstFieldRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setForm(normalizeExisting(existing));
    setErrors({});
    setMessage(null);
  }, [existing]);

  React.useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [open]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateAll(): FormErrors {
    const nextErrors: FormErrors = {};
    (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
      const err = fieldErrorMessage(key, String(form[key] ?? ""));
      if (err) {
        nextErrors[key] = err;
      }
    });
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = validateAll();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      client_id: form.clientId.trim(),
      title: form.title.trim(),
      sessions_included: Number(form.sessionsIncluded),
      sessions_used: Number(form.sessionsUsed || "0"),
      price_cents: Number(form.priceCents || "0"),
      currency: form.currency.trim().toUpperCase(),
      status: form.status,
      notes: form.notes.trim() || null,
    };

    setMessage(null);
    try {
      await submitPackage(existing, payload);
      startTransition(() => {
        router.refresh();
      });
      setOpen(false);
      setErrors({});
      if (!existing) {
        setForm((prev) => ({ ...DEFAULT_FORM, clientId: prev.clientId }));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar o pacote.");
    }
  }

  async function handleDelete() {
    if (!existing || pending) return;
    if (!window.confirm("Tens a certeza que queres remover o pacote?")) return;
    try {
      await deletePackage(existing);
      startTransition(() => {
        router.refresh();
      });
      setOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover o pacote.");
    }
  }

  return (
    <>
      <Button variant={existing ? "ghost" : "primary"} size="sm" onClick={() => setOpen(true)}>
        {existing ? "Editar pacote" : "Novo pacote"}
      </Button>

      {open && (
        <div
          className="neo-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={existing ? "Editar pacote" : "Criar novo pacote"}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="neo-dialog client-package-modal" role="document">
            <header className="neo-dialog__header">
              <div className="client-package-modal__intro">
                <span className="neo-surface__hint uppercase tracking-wide">
                  {existing ? "Editar pacote" : "Novo pacote"}
                </span>
                <h2 className="neo-dialog__title">
                  {existing ? existing.title ?? "Pacote personalizado" : "Criar pacote personalizado"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="client-package-modal__close"
              >
                <CloseIcon width={18} height={18} />
              </Button>
            </header>

            <form className="neo-dialog__content client-package-form" onSubmit={handleSubmit} noValidate>
              <div className="client-package-form__fields">
                <label className="client-package-form__field">
                  <span className="client-package-form__label">Cliente (ID)</span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    className={clsx("neo-field", errors.clientId && "neo-field--invalid")}
                    value={form.clientId}
                    onChange={(event) => setField("clientId", event.target.value)}
                    disabled={Boolean(existing)}
                    required
                  />
                  {errors.clientId && <span className="neo-field-error">{errors.clientId}</span>}
                </label>

                <label className="client-package-form__field">
                  <span className="client-package-form__label">Título do pacote</span>
                  <input
                    type="text"
                    className={clsx("neo-field", errors.title && "neo-field--invalid")}
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    placeholder="Ex.: Pack de 10 sessões"
                    required
                  />
                  {errors.title && <span className="neo-field-error">{errors.title}</span>}
                </label>

                <div className="client-package-form__grid">
                  <label className="client-package-form__field">
                    <span className="client-package-form__label">Sessões incluídas</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      className={clsx("neo-field", errors.sessionsIncluded && "neo-field--invalid")}
                      value={form.sessionsIncluded}
                      onChange={(event) => setField("sessionsIncluded", event.target.value)}
                      required
                    />
                    {errors.sessionsIncluded && <span className="neo-field-error">{errors.sessionsIncluded}</span>}
                  </label>

                  <label className="client-package-form__field">
                    <span className="client-package-form__label">Sessões usadas</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className={clsx("neo-field", errors.sessionsUsed && "neo-field--invalid")}
                      value={form.sessionsUsed}
                      onChange={(event) => setField("sessionsUsed", event.target.value)}
                    />
                    {errors.sessionsUsed && <span className="neo-field-error">{errors.sessionsUsed}</span>}
                  </label>
                </div>

                <div className="client-package-form__grid">
                  <label className="client-package-form__field">
                    <span className="client-package-form__label">Preço (cêntimos)</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className={clsx("neo-field", errors.priceCents && "neo-field--invalid")}
                      value={form.priceCents}
                      onChange={(event) => setField("priceCents", event.target.value)}
                    />
                    {errors.priceCents && <span className="neo-field-error">{errors.priceCents}</span>}
                  </label>

                  <label className="client-package-form__field">
                    <span className="client-package-form__label">Moeda</span>
                    <input
                      type="text"
                      className={clsx("neo-field", errors.currency && "neo-field--invalid")}
                      value={form.currency}
                      onChange={(event) => setField("currency", event.target.value.toUpperCase())}
                      maxLength={8}
                    />
                    {errors.currency && <span className="neo-field-error">{errors.currency}</span>}
                  </label>
                </div>

                <label className="client-package-form__field">
                  <span className="client-package-form__label">Estado</span>
                  <select
                    className={clsx("neo-field", errors.status && "neo-field--invalid")}
                    value={form.status}
                    onChange={(event) => setField("status", event.target.value as PackageStatus)}
                  >
                    {PACKAGE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {errors.status && <span className="neo-field-error">{errors.status}</span>}
                </label>

                <label className="client-package-form__field">
                  <span className="client-package-form__label">Notas internas</span>
                  <textarea
                    className={clsx("neo-field", errors.notes && "neo-field--invalid")}
                    rows={4}
                    value={form.notes}
                    onChange={(event) => setField("notes", event.target.value)}
                    placeholder="Notas adicionais ou condições específicas do pacote."
                  />
                  {errors.notes && <span className="neo-field-error">{errors.notes}</span>}
                </label>
              </div>

              {message && <p className="neo-field-error" role="alert">{message}</p>}

              <div className="neo-dialog__footer">
                {existing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="client-package-form__danger"
                    disabled={pending}
                  >
                    Remover pacote
                  </Button>
                )}
                <div className="client-package-form__footerActions">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm" loading={pending} loadingText="A guardar…">
                    Guardar
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
