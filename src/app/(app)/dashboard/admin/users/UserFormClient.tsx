'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export type Role = 'admin' | 'trainer' | 'client';
export type Status = 'active' | 'inactive';

export type UserFormValues = {
  id?: string;
  name: string;
  email: string;
  role: Role;
  status?: Status;
  approved?: boolean;
  active?: boolean;
};

const Roles: Role[] = ['admin', 'trainer', 'client'];
const Statuses: Status[] = ['active', 'inactive'];

const RoleSchema = z.union([z.literal('admin'), z.literal('trainer'), z.literal('client')]);
const StatusSchema = z.union([z.literal('active'), z.literal('inactive')]);

const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome muito curto'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  role: RoleSchema,
  status: StatusSchema.optional(),
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
});

type Feedback = { tone: 'success' | 'danger' | 'warning' | 'info'; message: string } | null;

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<UserFormValues>;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function UserFormClient({ mode, initial }: Props) {
  const router = useRouter();

  const [values, setValues] = React.useState<UserFormValues>(() => ({
    id: initial?.id,
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: (initial?.role as Role) ?? 'client',
    status: (initial?.status as Status) ?? 'active',
    approved: Boolean(initial?.approved ?? true),
    active: Boolean(initial?.active ?? true),
  }));

  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  const headingId = React.useId();

  function setField<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    setErrors({});

    const parsed = UserSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UserFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof UserFormValues | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      setFeedback({ tone: 'danger', message: 'Verifica os campos destacados.' });
      return;
    }

    const payload = parsed.data;

    try {
      let response: Response;
      if (mode === 'edit' && payload.id) {
        response = await fetch(`/api/admin/users/${payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status ?? 'active',
            approved: payload.approved ?? true,
            active: payload.active ?? true,
          }),
        });
      } else {
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status ?? 'active',
            approved: payload.approved ?? true,
            active: payload.active ?? true,
          }),
        });
      }

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || 'Falha ao gravar utilizador');
      }

      setFeedback({
        tone: 'success',
        message: mode === 'edit' ? 'Utilizador atualizado com sucesso.' : 'Utilizador criado com sucesso.',
      });
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message || 'Falha ao gravar utilizador.' });
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    if (!feedback) return;
    const handle = window.setTimeout(() => setFeedback(null), feedback.tone === 'success' ? 4000 : 6000);
    return () => window.clearTimeout(handle);
  }, [feedback]);

  return (
    <form
      className="neo-panel admin-user-form"
      aria-labelledby={headingId}
      onSubmit={onSubmit}
      noValidate
    >
      <header className="neo-panel__header">
        <div>
          <h1 id={headingId} className="neo-panel__title">
            {mode === 'edit' ? 'Editar utilizador' : 'Novo utilizador'}
          </h1>
          <p className="neo-panel__subtitle">
            Define o perfil, estado e permissões do utilizador.
          </p>
        </div>
      </header>

      <div className="neo-panel__body admin-user-form__body">
        {feedback && <Alert tone={feedback.tone} title="Estado">{feedback.message}</Alert>}

        <div className="admin-user-form__grid">
          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Nome</span>
            <input
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              className="neo-input"
              type="text"
              placeholder="Nome completo"
              autoComplete="name"
              required
            />
            {errors.name ? (
              <span className="neo-input-group__hint" data-tone="error">
                {errors.name}
              </span>
            ) : (
              <span className="neo-input-group__hint">Nome completo do utilizador.</span>
            )}
          </label>

          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Email</span>
            <input
              value={values.email}
              onChange={(event) => setField('email', event.target.value)}
              className="neo-input"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="email"
              required
            />
            {errors.email ? (
              <span className="neo-input-group__hint" data-tone="error">
                {errors.email}
              </span>
            ) : (
              <span className="neo-input-group__hint">Utilizado para autenticação e notificações.</span>
            )}
          </label>

          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Perfil</span>
            <select
              value={values.role}
              onChange={(event) => setField('role', event.target.value as Role)}
              className="neo-input"
              required
            >
              {Roles.map((role) => (
                <option key={role} value={role}>
                  {capitalize(role)}
                </option>
              ))}
            </select>
            {errors.role ? (
              <span className="neo-input-group__hint" data-tone="error">
                {errors.role}
              </span>
            ) : (
              <span className="neo-input-group__hint">Controla as permissões no dashboard.</span>
            )}
          </label>

          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Estado</span>
            <select
              value={values.status ?? 'active'}
              onChange={(event) => setField('status', event.target.value as Status)}
              className="neo-input"
            >
              {Statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'active' ? 'Ativo' : 'Inativo'}
                </option>
              ))}
            </select>
            {errors.status ? (
              <span className="neo-input-group__hint" data-tone="error">
                {errors.status}
              </span>
            ) : (
              <span className="neo-input-group__hint">Define se o utilizador pode iniciar sessão.</span>
            )}
          </label>
        </div>

        <fieldset className="admin-user-form__toggles">
          <legend className="admin-user-form__togglesTitle">Permissões</legend>
          <label className="neo-checkbox">
            <input
              type="checkbox"
              checked={Boolean(values.approved)}
              onChange={(event) => setField('approved', event.target.checked)}
            />
            <span>
              <span className="neo-checkbox__label">Aprovado</span>
              <span className="neo-checkbox__hint">Pode aceder às áreas reservadas.</span>
            </span>
          </label>
          <label className="neo-checkbox">
            <input
              type="checkbox"
              checked={Boolean(values.active)}
              onChange={(event) => setField('active', event.target.checked)}
            />
            <span>
              <span className="neo-checkbox__label">Ativo</span>
              <span className="neo-checkbox__hint">Marca o utilizador como ativo na plataforma.</span>
            </span>
          </label>
        </fieldset>
      </div>

      <footer className="neo-panel__footer admin-user-form__footer">
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={saving} loadingText={mode === 'edit' ? 'A atualizar…' : 'A criar…'}>
          {mode === 'edit' ? 'Guardar alterações' : 'Criar utilizador'}
        </Button>
      </footer>
    </form>
  );
}

