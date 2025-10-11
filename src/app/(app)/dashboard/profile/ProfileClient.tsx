'use client';

import * as React from 'react';

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

function StatusMessage({ status }: { status: Status }) {
  if (status.type === 'idle') return null;
  const color = status.type === 'success' ? 'text-emerald-600' : 'text-rose-600';
  return <p className={`text-sm font-medium ${color}`}>{status.message}</p>;
}

function AvatarPreview({
  url,
  email,
  name,
}: {
  url: string;
  email: string;
  name: string;
}) {
  const initials = React.useMemo(() => {
    const base = name || email || '';
    if (!base.trim()) return '?';
    const parts = base.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || base[0]?.toUpperCase() || '?';
  }, [email, name]);

  return (
    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
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

  React.useEffect(() => {
    const candidate = form.username.trim();
    const baselineUsername = baseline.username.trim();
    if (!candidate || candidate === baselineUsername) {
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
          setUsernameStatus({ state: 'invalid' });
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

    if (next.name !== baseline.name.trim()) payload.name = next.name;
    if (next.username !== baseline.username.trim()) payload.username = next.username || null;
    if (next.phone !== baseline.phone.trim()) payload.phone = next.phone || null;
    if (next.birthDate !== baseline.birthDate) payload.birth_date = next.birthDate || null;
    if (next.bio !== baseline.bio.trim()) payload.bio = next.bio || null;
    if (next.avatarUrl !== baseline.avatarUrl.trim()) payload.avatar_url = next.avatarUrl || null;

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

      setBaseline(next);
      setForm(next);
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
      <section className="card space-y-6 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Perfil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Atualiza os teus dados pessoais e controla a forma como és identificado na plataforma.
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col items-center gap-4 lg:w-56">
            <AvatarPreview url={form.avatarUrl} email={initialProfile.email} name={form.name} />
            <div className="flex flex-col items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarBusy}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {avatarBusy ? 'A enviar…' : 'Alterar fotografia'}
              </button>
              {form.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatarUrl: '' }))}
                  className="text-xs text-slate-500 underline transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Remover fotografia
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarSelected}
            />
          </div>

          <form onSubmit={onSubmit} className="flex-1 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">Nome completo</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/40"
                  placeholder="O teu nome"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">Email</span>
                <input
                  type="email"
                  value={initialProfile.email}
                  disabled
                  className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                />
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">Username</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className={`rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-500/40 ${
                    usernameStatus.state === 'taken' || usernameStatus.state === 'invalid'
                      ? 'border-rose-400 focus:ring-rose-200 dark:border-rose-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-400'
                  }`}
                  placeholder="Ex.: andremartins"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {form.username.trim().length === 0
                    ? 'Opcional. Usa letras, números, ponto, hífen ou underscore.'
                    : usernameStatus.state === 'checking'
                      ? 'A verificar disponibilidade…'
                      : usernameStatus.state === 'taken'
                        ? 'Este username já está em uso.'
                        : usernameStatus.state === 'invalid'
                          ? 'O username deve ter entre 3 e 30 caracteres válidos.'
                          : usernameStatus.state === 'error'
                            ? 'Não foi possível validar o username agora.'
                            : 'Este será o teu identificador público.'}
                </p>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">Telefone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="(+351) 910 000 000"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/40"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">Data de nascimento</span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/40"
                />
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">Biografia</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={4}
                  placeholder="Partilha um pouco sobre ti, objetivos ou preferências."
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/40"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage status={status} />
              <button
                type="submit"
                disabled={!dirty || saving || usernameStatus.state === 'checking'}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? 'A guardar…' : 'Guardar alterações'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Acesso e segurança</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A gestão da palavra-passe e notificações está disponível em <strong>Definições &gt; Conta</strong>.
        </p>
        <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900 dark:text-slate-100">Email</span>
            <span>{initialProfile.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900 dark:text-slate-100">Função</span>
            <span>{initialProfile.role ?? '—'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
