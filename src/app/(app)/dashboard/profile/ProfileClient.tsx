'use client';

import * as React from 'react';
import clsx from 'clsx';
import { Camera, Loader2, Save, ShieldCheck, Trash2 } from 'lucide-react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { normalizeUsername, validateUsernameCandidate } from '@/lib/username';

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

type UsernameHelperTone = 'muted' | 'checking' | 'success' | 'error';

type UsernameHelper = {
  message: string;
  tone: UsernameHelperTone;
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

function AvatarPreview({
  url,
  email,
  name,
  className,
  style,
  size = 'lg',
}: {
  url: string;
  email: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'md' | 'lg';
}) {
  const initials = React.useMemo(() => {
    const base = name || email || '';
    if (!base.trim()) return '?';
    const parts = base.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || base[0]?.toUpperCase() || '?';
  }, [email, name]);

  return (
    <div className={clsx('profile-avatar', className)} data-size={size} style={style}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name || email} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function ProfileStatus({ status, id }: { status: Status; id: string }) {
  if (status.type === 'idle') return null;
  const tone = status.type === 'success' ? 'success' : 'danger';
  const message =
    status.message ??
    (status.type === 'success'
      ? 'Alterações guardadas com sucesso.'
      : 'Não foi possível concluir a ação.');
  return <Alert id={id} tone={tone} className="profile-status" title={message} />;
}

function resolveUsernameHelper(value: string, status: UsernameStatus): UsernameHelper {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      message: 'Opcional. Usa letras, números, ponto, hífen ou underscore.',
      tone: 'muted',
    };
  }

  switch (status.state) {
    case 'checking':
      return { message: 'A verificar disponibilidade…', tone: 'checking' };
    case 'taken':
      return { message: 'Este username já está em uso.', tone: 'error' };
    case 'invalid':
      if (status.reason === 'reserved') {
        return { message: 'Este username não está disponível.', tone: 'error' };
      }
      if (status.reason === 'length') {
        return { message: 'O username deve ter entre 3 e 30 caracteres.', tone: 'error' };
      }
      if (status.reason === 'format') {
        return {
          message: 'Só podes usar letras, números, ponto, hífen ou underscore.',
          tone: 'error',
        };
      }
      return {
        message: 'O username deve ter entre 3 e 30 caracteres válidos.',
        tone: 'error',
      };
    case 'error':
      return { message: 'Não foi possível validar o username agora.', tone: 'error' };
    case 'available':
      return { message: 'Perfeito! Este username está disponível.', tone: 'success' };
    case 'idle':
    default:
      return { message: 'Este será o teu identificador público.', tone: 'muted' };
  }
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
  const heroHeadingId = React.useId();
  const avatarAsideLabelId = React.useId();

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

  const usernameHelper = React.useMemo(() => resolveUsernameHelper(form.username, usernameStatus), [
    form.username,
    usernameStatus,
  ]);

  const displayName = form.name.trim() || initialProfile.email;
  const roleLabel = initialProfile.role ?? 'Cliente';

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
    <div className="profile-shell">
      <section className="neo-panel profile-panel" aria-labelledby={heroHeadingId}>
        <div className="profile-panel__hero profile-hero">
          <div className="profile-panel__intro">
            <span className="profile-panel__introLabel">Perfil do cliente</span>
            <h1 id={heroHeadingId} className="profile-panel__title">
              {displayName}
            </h1>
            <p className="profile-panel__description">
              Atualiza os teus dados pessoais e controla a forma como és identificado na plataforma.
            </p>
          </div>
          <div className="profile-panel__heroMeta">
            <AvatarPreview
              url={form.avatarUrl}
              email={initialProfile.email}
              name={form.name}
              className="profile-hero__avatar"
              size="lg"
            />
            <div className="profile-panel__meta">
              <span className="profile-panel__pill">{roleLabel}</span>
              <span className="profile-panel__metaEmail">{initialProfile.email}</span>
            </div>
          </div>
        </div>

        <div className="profile-panel__body">
          <aside className="profile-aside" aria-labelledby={avatarAsideLabelId}>
            <h2 id={avatarAsideLabelId} className="sr-only">
              Gestão da fotografia de perfil
            </h2>
            <AvatarPreview
              url={form.avatarUrl}
              email={initialProfile.email}
              name={form.name}
              className="profile-aside__avatar"
              size="md"
            />
            <div className="profile-aside__actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={avatarBusy}
                leftIcon={
                  avatarBusy ? <Loader2 className="icon-spin" aria-hidden /> : <Camera className="icon" aria-hidden />
                }
                loadingText="A enviar…"
              >
                Alterar fotografia
              </Button>
              {form.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}
                  className="profile-aside__remove"
                >
                  <Trash2 className="profile-aside__removeIcon" aria-hidden />
                  Remover fotografia
                </button>
              ) : null}
            </div>
            <p className="profile-aside__hint">
              Dica: escolhe uma fotografia com fundo neutro e boa iluminação para melhor visibilidade.
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onAvatarSelected} />
          </aside>

          <form onSubmit={onSubmit} className="profile-form" aria-describedby={status.type === 'idle' ? undefined : statusMessageId}>
            <fieldset className="profile-form__grid profile-form__grid--two">
              <legend className="sr-only">Informação principal</legend>
              <label className="profile-form__field">
                <span className="profile-form__label">Nome completo</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="neo-field"
                  placeholder="O teu nome"
                  autoComplete="name"
                />
                <span className="profile-form__description">
                  Como preferes ser identificado em planos e mensagens.
                </span>
              </label>
              <label className="profile-form__field">
                <span className="profile-form__label">Email</span>
                <input type="email" value={initialProfile.email} disabled className="neo-field" />
                <span className="profile-form__description">
                  Email principal associado à tua conta. Gestão disponível em Definições &gt; Conta.
                </span>
              </label>
              <label className="profile-form__field profile-form__field--full">
                <span className="profile-form__label">Username</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className={clsx('neo-field', {
                    'neo-field--invalid':
                      usernameStatus.state === 'taken' || usernameStatus.state === 'invalid',
                  })}
                  placeholder="Ex.: andremartins"
                  aria-describedby={usernameHintId}
                  autoComplete="nickname"
                />
                <span className="profile-form__description" id={usernameHintId} data-state={usernameHelper.tone}>
                  {usernameHelper.message}
                </span>
              </label>
            </fieldset>

            <fieldset className="profile-form__grid profile-form__grid--two">
              <legend className="sr-only">Contactos e detalhes adicionais</legend>
              <label className="profile-form__field">
                <span className="profile-form__label">Telefone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="(+351) 910 000 000"
                  className="neo-field"
                  autoComplete="tel"
                />
                <span className="profile-form__description">
                  Partilha um contacto para comunicações rápidas com o teu treinador.
                </span>
              </label>
              <label className="profile-form__field">
                <span className="profile-form__label">Data de nascimento</span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                  className="neo-field"
                />
                <span className="profile-form__description">
                  Mantém os teus dados atualizados para receber planos personalizados.
                </span>
              </label>
              <label className="profile-form__field profile-form__field--full">
                <span className="profile-form__label">Biografia</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={4}
                  placeholder="Partilha um pouco sobre ti, objetivos ou preferências."
                  className="neo-field"
                />
                <span className="profile-form__description">
                  Dá contexto ao teu treinador sobre objetivos, historial ou preferências.
                </span>
              </label>
            </fieldset>

            <div className="profile-form__actions">
              <ProfileStatus status={status} id={statusMessageId} />
              <Button
                type="submit"
                variant="primary"
                leftIcon={
                  saving ? <Loader2 className="icon-spin" aria-hidden /> : <Save className="icon" aria-hidden />
                }
                disabled={!dirty || saving || usernameStatus.state === 'checking'}
                loading={saving}
                loadingText="A guardar…"
              >
                Guardar alterações
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="neo-panel profile-security" aria-labelledby="profile-security-heading">
        <header className="profile-security__header">
          <ShieldCheck className="profile-security__icon" aria-hidden />
          <div>
            <h2 id="profile-security-heading" className="neo-panel__title">
              Acesso e segurança
            </h2>
            <p className="neo-panel__subtitle">
              A gestão da palavra-passe e notificações está disponível em <strong>Definições &gt; Conta</strong>.
            </p>
          </div>
        </header>
        <div className="profile-security__grid">
          <div className="profile-security__item">
            <span className="profile-security__label">Email</span>
            <p className="profile-security__value">{initialProfile.email}</p>
          </div>
          <div className="profile-security__item">
            <span className="profile-security__label">Função</span>
            <p className="profile-security__value">{roleLabel}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
