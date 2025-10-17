'use client';

import * as React from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { normalizeUsername, validateUsernameCandidate } from '@/lib/username';
import UIButton from '@/components/ui/UIButton';

type ProfileModel = {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: string | null;
  phone: string | null;
  birthDate: string | null;
  bio: string | null;
};

type Status = { type: 'idle' | 'success' | 'error'; message?: string };

type UsernameStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available' }
  | { state: 'taken'; reason?: string }
  | { state: 'invalid'; reason?: string }
  | { state: 'error' };

type FormState = {
  name: string;
  username: string;
  phone: string;
  birthDate: string;
  bio: string;
  avatarUrl: string;
};

function normalizeDateInput(value: string | null) {
  if (!value) return '';
  if (value.length >= 10) return value.slice(0, 10);
  return value;
}

function toFormString(value: unknown) {
  if (value == null) return '';
  return String(value).trim();
}

function applyServerProfilePatch(base: FormState, patch: unknown): FormState {
  if (!patch || typeof patch !== 'object') return { ...base };
  const record = patch as Record<string, unknown>;
  const next: FormState = { ...base };

  if ('name' in record) next.name = toFormString(record.name);
  if ('username' in record) next.username = toFormString(record.username);
  if ('phone' in record) next.phone = toFormString(record.phone);
  if ('bio' in record) next.bio = toFormString(record.bio);
  if ('avatar_url' in record) next.avatarUrl = toFormString(record.avatar_url);
  if ('birth_date' in record) {
    const birth = typeof record.birth_date === 'string' ? record.birth_date : null;
    next.birthDate = normalizeDateInput(birth);
  }

  return next;
}

function sanitizeInitial(profile: ProfileModel): FormState {
  return {
    name: (profile.name ?? '').trim(),
    username: (profile.username ?? '').trim(),
    phone: profile.phone ?? '',
    birthDate: normalizeDateInput(profile.birthDate ?? null),
    bio: (profile.bio ?? '').trim(),
    avatarUrl: (profile.avatarUrl ?? '').trim(),
  };
}

function StatusMessage({ status, id }: { status: Status; id: string }) {
  if (status.type === 'idle') return null;
  const Icon = status.type === 'success' ? CheckCircle2 : AlertCircle;
  const tone =
    status.type === 'success'
      ? 'var(--success-strong, var(--success, #10b981))'
      : 'var(--danger-strong, var(--danger, #ef4444))';

  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 text-sm font-medium"
      style={{ color: tone }}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span>{status.message}</span>
    </p>
  );
}

function AvatarPreview({
  url,
  email,
  name,
  className,
  style,
}: {
  url: string;
  email: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const initials = React.useMemo(() => {
    const base = name || email || '';
    if (!base.trim()) return '?';
    const parts = base.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || base[0]?.toUpperCase() || '?';
  }, [email, name]);

  return (
    <div
      className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold transition-all duration-200 ${
        className ?? ''
      }`}
      style={{
        border: '1px solid var(--avatar-border, rgba(148,163,209,0.4))',
        background: 'var(--avatar-bg, rgba(226,232,255,0.32))',
        color: 'var(--avatar-fg, var(--muted-fg))',
        boxShadow: 'var(--avatar-shadow, 0 18px 42px rgba(15,35,92,0.12))',
        ...style,
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name || email} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function ProfileClient({ initialProfile }: { initialProfile: ProfileModel }) {
  const initialState = React.useMemo(() => sanitizeInitial(initialProfile), [initialProfile]);
  const [form, setForm] = React.useState<FormState>(initialState);
  const [baseline, setBaseline] = React.useState<FormState>(initialState);
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });
  const [saving, setSaving] = React.useState(false);
  const [avatarBusy, setAvatarBusy] = React.useState(false);
  const [usernameStatus, setUsernameStatus] = React.useState<UsernameStatus>({ state: 'idle' });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const usernameHintId = React.useId();
  const statusMessageId = React.useId();

  React.useEffect(() => {
    const candidate = form.username.trim();
    const baselineUsername = baseline.username.trim();
    if (!candidate || candidate === baselineUsername) {
      setUsernameStatus({ state: 'idle' });
      return;
    }

    const validation = validateUsernameCandidate(candidate);
    if (!validation.ok) {
      const reason = 'reason' in validation ? validation.reason : undefined;
      setUsernameStatus({ state: 'invalid', reason });
      return;
    }

    const normalizedCandidate = validation.normalized;
    const normalizedBaseline = baselineUsername ? normalizeUsername(baselineUsername) : '';
    if (normalizedCandidate === normalizedBaseline) {
      setUsernameStatus({ state: 'idle' });
      return;
    }

    const controller = new AbortController();
    setUsernameStatus({ state: 'checking' });

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(candidate)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          setUsernameStatus({ state: 'error' });
          return;
        }
        if (data.reason === 'INVALID_OR_RESERVED') {
          setUsernameStatus({ state: 'invalid', reason: 'reserved' });
          return;
        }
        if (data.available) {
          setUsernameStatus({ state: 'available' });
        } else {
          setUsernameStatus({ state: 'taken' });
        }
      } catch (error: unknown) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return;
        setUsernameStatus({ state: 'error' });
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [form.username, baseline.username]);

  const dirty = React.useMemo(() => {
    return (
      form.name.trim() !== baseline.name.trim() ||
      form.username.trim() !== baseline.username.trim() ||
      form.phone.trim() !== baseline.phone.trim() ||
      form.birthDate !== baseline.birthDate ||
      form.bio.trim() !== baseline.bio.trim() ||
      form.avatarUrl.trim() !== baseline.avatarUrl.trim()
    );
  }, [form, baseline]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || !dirty) return;

    if (usernameStatus.state === 'checking') return;
    if (usernameStatus.state === 'taken') {
      setStatus({ type: 'error', message: 'Este username já está em uso.' });
      return;
    }
    if (usernameStatus.state === 'invalid') {
      setStatus({ type: 'error', message: 'Escolhe um username com 3 a 30 caracteres válidos.' });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle' });

    const payload: Record<string, unknown> = {};
    const next: FormState = {
      name: form.name.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate,
      bio: form.bio.trim(),
      avatarUrl: form.avatarUrl.trim(),
    };

    const baselineName = baseline.name.trim();
    const baselineUsername = baseline.username.trim();
    const baselinePhone = baseline.phone.trim();
    const baselineBio = baseline.bio.trim();
    const baselineAvatar = baseline.avatarUrl.trim();

    if (next.name !== baselineName) payload.name = next.name;

    const normalizedBaselineUsername = baselineUsername ? normalizeUsername(baselineUsername) : '';
    const normalizedNextUsername = next.username ? normalizeUsername(next.username) : '';
    next.username = normalizedNextUsername;
    if (normalizedNextUsername !== normalizedBaselineUsername) {
      payload.username = normalizedNextUsername || null;
    }

    if (next.phone !== baselinePhone) payload.phone = next.phone || null;
    if (next.birthDate !== baseline.birthDate) payload.birth_date = next.birthDate || null;
    if (next.bio !== baselineBio) payload.bio = next.bio || null;
    if (next.avatarUrl !== baselineAvatar) payload.avatar_url = next.avatarUrl || null;

    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        if (data?.error === 'USERNAME_TAKEN') {
          setUsernameStatus({ state: 'taken' });
          throw new Error('Este username já está em uso.');
        }
        if (data?.error === 'INVALID_USERNAME') {
          throw new Error('O username escolhido não é válido.');
        }
        if (data?.error === 'INVALID_DATE') {
          throw new Error('Insere uma data de nascimento válida (AAAA-MM-DD).');
        }
        throw new Error('Não foi possível guardar as alterações.');
      }

      const merged = applyServerProfilePatch(next, data?.profile);
      setBaseline(merged);
      setForm(merged);
      setStatus({ type: 'success', message: 'Perfil atualizado com sucesso.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível guardar as alterações.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    setStatus({ type: 'idle' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/me/avatar', { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error('Não foi possível atualizar a fotografia.');
      }
      const url = String(data.avatar_url || '');
      const next = { ...baseline, avatarUrl: url.trim() };
      setBaseline(next);
      setForm(next);
      setStatus({ type: 'success', message: 'Fotografia atualizada.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível atualizar a fotografia.',
      });
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="profile-hero px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="profile-hero__muted text-xs font-semibold uppercase tracking-[0.18em]">
                Perfil do cliente
              </span>
              <h1 className="text-2xl font-semibold sm:text-3xl">
                {form.name.trim() || initialProfile.email}
              </h1>
              <p className="profile-hero__muted max-w-xl text-sm">
                Atualiza os teus dados pessoais e controla a forma como és identificado na plataforma.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 lg:items-end">
              <AvatarPreview
                url={form.avatarUrl}
                email={initialProfile.email}
                name={form.name}
                className="profile-hero__avatar h-24 w-24 md:h-28 md:w-28"
              />
              <div className="profile-hero__muted flex flex-col items-center gap-2 text-xs font-medium lg:items-end">
                <span className="profile-hero__pill">
                  {initialProfile.role ?? 'Cliente'}
                </span>
                <span>{initialProfile.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 lg:flex-row">
          <div
            className="flex flex-col items-center gap-4 rounded-2xl bg-[color:color-mix(in_srgb,var(--card-bg)_92%,var(--bg)_8%)] p-5 text-sm text-[color:var(--fg)] shadow-sm ring-1 ring-[color:color-mix(in_srgb,var(--border)_68%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--card-bg)_86%,transparent)] dark:ring-[color:color-mix(in_srgb,var(--border)_72%,transparent)] lg:w-56"
          >
            <AvatarPreview
              url={form.avatarUrl}
              email={initialProfile.email}
              name={form.name}
              className="h-24 w-24 md:h-28 md:w-28"
              style={{
                '--avatar-border': 'color-mix(in srgb, var(--border) 70%, transparent)',
                '--avatar-bg': 'color-mix(in srgb, var(--card-bg) 94%, var(--bg) 6%)',
                '--avatar-shadow': '0 18px 44px color-mix(in srgb, var(--border) 22%, transparent)',
              } as React.CSSProperties}
            />
            <div className="flex flex-col items-center gap-2 text-[color:var(--muted-fg)]">
              <UIButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarBusy}
                variant="outline"
                size="sm"
                className="inline-flex items-center justify-center gap-2"
              >
                {avatarBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
                <span>{avatarBusy ? 'A enviar…' : 'Alterar fotografia'}</span>
              </UIButton>
              {form.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}
                  className="inline-flex items-center gap-1 text-xs text-[color:var(--muted-fg)] underline transition hover:text-[color:var(--fg)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Remover fotografia
                </button>
              ) : null}
            </div>
            <p className="text-center text-xs text-[color:var(--muted-fg)]">
              Dica: escolhe uma fotografia com fundo neutro e boa iluminação para melhor visibilidade.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarSelected}
            />
          </div>

          <form onSubmit={onSubmit} className="flex-1 space-y-6">
            <fieldset className="grid gap-4 md:grid-cols-2">
              <legend className="sr-only">Informação principal</legend>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-[color:var(--fg)]">Nome completo</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="neo-field"
                  placeholder="O teu nome"
                  autoComplete="name"
                />
                <span className="text-xs text-[color:var(--muted-fg)]">
                  Como preferes ser identificado em planos e mensagens.
                </span>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-[color:var(--fg)]">Email</span>
                <input
                  type="email"
                  value={initialProfile.email}
                  disabled
                  className="neo-field"
                />
                <span className="text-xs text-[color:var(--muted-fg)]">
                  Email principal associado à tua conta. Gestão disponível em Definições &gt; Conta.
                </span>
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium text-[color:var(--fg)]">Username</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className={`neo-field ${
                    usernameStatus.state === 'taken' || usernameStatus.state === 'invalid' ? 'neo-field--invalid' : ''
                  }`}
                  placeholder="Ex.: andremartins"
                  aria-describedby={usernameHintId}
                  autoComplete="nickname"
                />
                <p id={usernameHintId} className="text-xs text-[color:var(--muted-fg)]">
                  {form.username.trim().length === 0
                    ? 'Opcional. Usa letras, números, ponto, hífen ou underscore.'
                    : usernameStatus.state === 'checking'
                      ? 'A verificar disponibilidade…'
                      : usernameStatus.state === 'taken'
                        ? 'Este username já está em uso.'
                    : usernameStatus.state === 'invalid'
                      ? usernameStatus.reason === 'reserved'
                        ? 'Este username não está disponível.'
                        : usernameStatus.reason === 'length'
                          ? 'O username deve ter entre 3 e 30 caracteres.'
                          : usernameStatus.reason === 'format'
                            ? 'Só podes usar letras, números, ponto, hífen ou underscore.'
                            : 'O username deve ter entre 3 e 30 caracteres válidos.'
                          : usernameStatus.state === 'error'
                            ? 'Não foi possível validar o username agora.'
                            : 'Este será o teu identificador público.'}
                </p>
              </label>
            </fieldset>

            <fieldset className="grid gap-4 md:grid-cols-2">
              <legend className="sr-only">Contactos e detalhes adicionais</legend>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-[color:var(--fg)]">Telefone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="(+351) 910 000 000"
                  className="neo-field"
                  autoComplete="tel"
                />
                <span className="text-xs text-[color:var(--muted-fg)]">
                  Partilha um contacto para comunicações rápidas com o teu treinador.
                </span>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-[color:var(--fg)]">Data de nascimento</span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                  className="neo-field"
                />
                <span className="text-xs text-[color:var(--muted-fg)]">
                  Mantém os teus dados atualizados para receber planos personalizados.
                </span>
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium text-[color:var(--fg)]">Biografia</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={4}
                  placeholder="Partilha um pouco sobre ti, objetivos ou preferências."
                  className="neo-field"
                />
                <span className="text-xs text-[color:var(--muted-fg)]">
                  Dá contexto ao teu treinador sobre objetivos, historial ou preferências.
                </span>
              </label>
            </fieldset>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage status={status} id={statusMessageId} />
              <UIButton
                type="submit"
                disabled={!dirty || saving || usernameStatus.state === 'checking'}
                className="inline-flex items-center justify-center gap-2"
                aria-describedby={status.type === 'idle' ? undefined : statusMessageId}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                <span>{saving ? 'A guardar…' : 'Guardar alterações'}</span>
              </UIButton>
            </div>
          </form>
        </div>
      </section>

      <section className="card space-y-5 p-6">
        <header className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5" aria-hidden style={{ color: 'var(--accent, #7f5bff)' }} />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Acesso e segurança</h2>
            <p className="text-sm text-[color:var(--muted-fg)]">
              A gestão da palavra-passe e notificações está disponível em <strong>Definições &gt; Conta</strong>.
            </p>
          </div>
        </header>
        <div className="grid gap-3 text-sm text-[color:var(--muted-fg)] sm:grid-cols-2">
          <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--card-bg)_96%,var(--bg)_4%)] px-4 py-3 shadow-[0_16px_34px_rgba(12,34,66,0.08)]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-fg)]">Email</span>
            <p className="truncate text-sm font-medium text-[color:var(--fg)]">{initialProfile.email}</p>
          </div>
          <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--card-bg)_96%,var(--bg)_4%)] px-4 py-3 shadow-[0_16px_34px_rgba(12,34,66,0.08)]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-fg)]">Função</span>
            <p className="text-sm font-medium text-[color:var(--fg)]">
              {initialProfile.role ?? 'Cliente'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
