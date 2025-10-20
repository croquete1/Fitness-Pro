'use client';

import * as React from 'react';
import clsx from 'clsx';

import Button from '@/components/ui/Button';

type Initial = {
  username: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'PT' | 'TRAINER' | 'ADMIN';
  avatar_url: string;
  gender: string;
  dob: string;
  height_cm: number | null;
  weight_kg: number | null;
};

type UsernameState = {
  checking: boolean;
  ok: boolean;
  reason?: string;
};

type Feedback = {
  tone: 'success' | 'danger' | 'warning' | 'info';
  message: string;
};

type Helper = {
  tone: 'muted' | 'checking' | 'success' | 'error';
  message: string;
};

function resolveUsernameHelper(changed: boolean, username: string, state: UsernameState): Helper {
  const trimmed = username.trim();
  if (!changed || !trimmed) {
    return { tone: 'muted', message: 'O teu identificador público.' };
  }

  if (state.checking) {
    return { tone: 'checking', message: 'A verificar disponibilidade…' };
  }

  if (!state.ok) {
    if (state.reason === 'invalid_format') {
      return {
        tone: 'error',
        message: 'Usa 3–24 caracteres válidos (letras, números, ponto, hífen ou underscore).',
      };
    }
    if (state.reason === 'taken') {
      return { tone: 'error', message: 'Este username já está ocupado.' };
    }
    if (state.reason === 'reserved') {
      return { tone: 'error', message: 'Este username não está disponível.' };
    }
    return { tone: 'error', message: 'Não foi possível validar o username.' };
  }

  return { tone: 'success', message: 'Perfeito! Este username está disponível.' };
}

export default function ProfileForm({ initial }: { initial: Initial }) {
  const [form, setForm] = React.useState<Initial>(initial);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string>('Sem alterações por guardar.');

  const [usernameState, setUsernameState] = React.useState<UsernameState>({ checking: false, ok: true });
  const usernameChanged = React.useMemo(() => {
    const current = form.username.trim();
    const baseline = (initial.username || '').trim();
    return Boolean(current && current !== baseline);
  }, [form.username, initial.username]);

  React.useEffect(() => {
    const candidate = form.username.trim();
    if (!candidate || !usernameChanged) {
      setUsernameState({ checking: false, ok: true });
      return;
    }

    const controller = new AbortController();
    setUsernameState({ checking: true, ok: false });

    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/check-username?q=${encodeURIComponent(candidate)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        const ok = Boolean(json?.available);
        setUsernameState({ checking: false, ok, reason: ok ? undefined : json?.reason });
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        setUsernameState({ checking: false, ok: false });
      }
    }, 350);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [form.username, usernameChanged]);

  const usernameHelper = React.useMemo(
    () => resolveUsernameHelper(usernameChanged, form.username, usernameState),
    [form.username, usernameChanged, usernameState],
  );

  const usernameError = usernameChanged && !usernameState.checking && !usernameState.ok;

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const statusId = React.useId();
  const usernameHelperId = React.useId();

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setStatusMessage('Tens alterações por guardar.');
  }

  const pickFile = () => fileRef.current?.click();

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.url) {
        setForm((prev) => ({ ...prev, avatar_url: data.url }));
        setDirty(true);
        setStatusMessage('Tens alterações por guardar.');
        setFeedback({ tone: 'success', message: 'Avatar actualizado.' });
      } else {
        setFeedback({ tone: 'danger', message: 'Falha no upload do avatar.' });
      }
    } catch {
      setFeedback({ tone: 'danger', message: 'Não foi possível carregar o avatar.' });
    } finally {
      if (fileRef.current) {
        fileRef.current.value = '';
      }
      setUploading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !dirty || usernameError) return;

    setSaving(true);
    setFeedback(null);
    setStatusMessage('A guardar alterações…');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (payload?.field === 'username' && payload?.reason === 'taken') {
          setUsernameState({ checking: false, ok: false, reason: 'taken' });
          setFeedback({ tone: 'danger', message: 'Esse username já está ocupado.' });
        } else {
          setFeedback({ tone: 'danger', message: 'Falha ao guardar alterações.' });
        }
        setStatusMessage('Ocorreram erros ao guardar.');
        return;
      }

      setDirty(false);
      setStatusMessage('Perfil actualizado com sucesso.');
      setFeedback({ tone: 'success', message: 'Perfil actualizado.' });
    } catch {
      setFeedback({ tone: 'danger', message: 'Erro inesperado ao guardar.' });
      setStatusMessage('Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={onSubmit} noValidate aria-describedby={statusId}>
      <section className="neo-panel">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h2 className="neo-panel__title">Dados da conta</h2>
            <p className="neo-panel__subtitle">
              Actualiza o identificador e os dados básicos do teu perfil.
            </p>
          </div>
          <span className="status-pill" data-state={dirty ? 'warn' : 'neutral'}>
            {dirty ? 'Alterações por guardar' : 'Sincronizado'}
          </span>
        </header>

        <div className="profile-form__grid">
          <label>
            <span>Username</span>
            <input
              type="text"
              className={clsx('neo-field', usernameError && 'neo-field--invalid')}
              value={form.username}
              onChange={(event) => set('username', event.target.value)}
              placeholder="Ex.: joao.silva"
              aria-describedby={usernameHelperId}
              autoComplete="nickname"
            />
            <span id={usernameHelperId} data-tone={usernameHelper.tone}>
              {usernameHelper.message}
              {usernameState.checking && <span className="neo-spinner" aria-hidden />}
            </span>
          </label>

          <label>
            <span>Nome</span>
            <input
              type="text"
              className="neo-field"
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder="O teu nome"
              autoComplete="name"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              className="neo-field"
              value={form.email}
              onChange={(event) => set('email', event.target.value)}
              placeholder="nome@empresa.com"
              autoComplete="email"
            />
          </label>

          <label>
            <span>Género</span>
            <select
              className="neo-field"
              value={form.gender || ''}
              onChange={(event) => set('gender', event.target.value)}
            >
              <option value="">Seleciona…</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
              <option value="prefer_not">Prefiro não dizer</option>
            </select>
          </label>

          <label>
            <span>Data de nascimento</span>
            <input
              type="date"
              className="neo-field"
              value={form.dob ? form.dob.slice(0, 10) : ''}
              onChange={(event) => set('dob', event.target.value)}
            />
          </label>

          <label>
            <span>Altura (cm)</span>
            <input
              type="number"
              className="neo-field"
              inputMode="decimal"
              value={form.height_cm ?? ''}
              onChange={(event) => {
                const { value } = event.target;
                set('height_cm', value === '' ? null : Number(value));
              }}
              placeholder="Ex.: 172"
            />
          </label>

          <label>
            <span>Peso (kg)</span>
            <input
              type="number"
              className="neo-field"
              inputMode="decimal"
              value={form.weight_kg ?? ''}
              onChange={(event) => {
                const { value } = event.target;
                set('weight_kg', value === '' ? null : Number(value));
              }}
              placeholder="Ex.: 68"
            />
          </label>
        </div>
      </section>

      <section className="neo-panel profile-dashboard__form" aria-label="Gestão de avatar">
        <header>
          <div>
            <h2>Avatar</h2>
            <p>Actualiza a fotografia usada nos dashboards e planos partilhados.</p>
          </div>
          <div className="profile-dashboard__avatarActions">
            <input ref={fileRef} hidden type="file" accept="image/*" onChange={onFileChange} />
            <Button variant="secondary" size="sm" onClick={pickFile} loading={uploading}>
              {uploading ? 'A enviar…' : 'Carregar fotografia'}
            </Button>
            <button
              type="button"
              className="profile-dashboard__avatarRemove"
              onClick={() => {
                set('avatar_url', '');
              }}
              disabled={uploading || !form.avatar_url}
            >
              Remover fotografia
            </button>
          </div>
        </header>

        <div className="profile-dashboard__avatar" aria-hidden="true">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" />
          ) : (
            <span className="profile-dashboard__avatarPlaceholder">Sem fotografia</span>
          )}
        </div>

        <div className="profile-form__actions">
          <div className="profile-status" role="status" id={statusId} aria-live="polite">
            {feedback && (
              <div className="neo-alert" data-tone={feedback.tone}>
                <div className="neo-alert__content">
                  <p className="neo-alert__message">{feedback.message}</p>
                </div>
              </div>
            )}
            <p className="neo-text--sm text-muted">{statusMessage}</p>
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={!dirty || saving || usernameState.checking || usernameError}
          >
            Guardar alterações
          </Button>
        </div>
      </section>
    </form>
  );
}
