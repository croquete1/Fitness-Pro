'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  userId: string;
  initial?: {
    name?: string | null;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    phone?: string | null; // guarda em E.164 (ex.: +351912345678)
  };
  canEditPrivate?: boolean;
};

// Aceita "+", "00", espaços, traços, (), e normaliza para E.164 (+########...)
// Regras: 7–15 dígitos. Se só tiver 9 dígitos (PT), assume +351.
function normalizePhoneIntl(raw: string) {
  let v = (raw || '').trim();
  if (!v) return { e164: null, error: null };

  // substitui 00XX… por +XX…
  if (v.startsWith('00')) v = '+' + v.slice(2);

  // remove espaços, hífens, parêntesis
  v = v.replace(/[\s\-()]/g, '');

  // se não começar por +, apenas dígitos
  if (!v.startsWith('+')) {
    const digits = v.replace(/\D/g, '');
    if (!digits) return { e164: null, error: 'Telefone inválido.' };
    if (digits.length === 9) return { e164: `+351${digits}`, error: null };
    if (digits.length < 7 || digits.length > 15) return { e164: null, error: 'Telefone inválido (7 a 15 dígitos).' };
    return { e164: `+${digits}`, error: null };
  }

  // começa por +
  const rest = v.slice(1).replace(/\D/g, '');
  if (rest.length < 7 || rest.length > 15) return { e164: null, error: 'Telefone inválido (7 a 15 dígitos).' };
  return { e164: `+${rest}`, error: null };
}

export default function ProfileForm({ userId: _userId, initial, canEditPrivate = true }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [baseline, setBaseline] = useState(() => ({
    name: initial?.name?.trim() ?? '',
    username: initial?.username?.trim().toLowerCase() ?? '',
    bio: initial?.bio?.trim() ?? '',
    phone: initial?.phone ?? null,
  }));

  const [uCheck, setUCheck] = useState<{ loading: boolean; available: boolean | null; reason?: string }>(
    { loading: false, available: null, reason: undefined },
  );

  const phoneInfo = useMemo(() => normalizePhoneIntl(phone), [phone]);

  useEffect(() => {
    const candidate = username.trim();
    const base = baseline.username ?? '';
    if (!candidate || candidate === base) {
      setUCheck({ loading: false, available: null, reason: undefined });
      return;
    }

    const controller = new AbortController();
    setUCheck({ loading: true, available: null, reason: undefined });

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/username/check?q=${encodeURIComponent(candidate)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const reason = data?.reason ?? (res.status === 401 ? 'unauthorized' : undefined);
          setUCheck({ loading: false, available: false, reason });
          return;
        }

        setUCheck({
          loading: false,
          available: Boolean(data?.available),
          reason: data?.available ? undefined : data?.reason,
        });
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        setUCheck({ loading: false, available: null, reason: 'error' });
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [username, baseline.username]);

  const usernameInvalid = Boolean(username.trim() && uCheck.available === false);
  const usernameHelper = useMemo(() => {
    const candidate = username.trim();
    if (!candidate) return 'Opcional. Este será o teu identificador público.';
    if (uCheck.loading) return 'A verificar disponibilidade…';
    if (uCheck.available === false) {
      switch (uCheck.reason) {
        case 'length':
          return 'O username deve ter entre 3 e 30 caracteres.';
        case 'format':
          return 'Usa apenas letras, números, ponto, hífen ou underscore.';
        case 'taken':
          return 'Este username já está em uso.';
        case 'unauthorized':
          return 'Inicia sessão para verificar a disponibilidade.';
        default:
          return 'Não foi possível confirmar disponibilidade agora.';
      }
    }
    if (uCheck.available) return 'Disponível!';
    return 'Escreve para escolheres um username único.';
  }, [username, uCheck.loading, uCheck.available, uCheck.reason]);

  const canSave = useMemo(() => {
    const cleanName = name.trim();
    const cleanUser = username.trim();
    const cleanBio = bio.trim();
    const normalizedPhone = phoneInfo.e164 ?? null;
    return (
      cleanName !== (baseline.name ?? '') ||
      cleanUser !== (baseline.username ?? '') ||
      cleanBio !== (baseline.bio ?? '') ||
      (canEditPrivate && normalizedPhone !== (baseline.phone ?? null))
    );
  }, [name, username, bio, phoneInfo.e164, baseline.name, baseline.username, baseline.bio, baseline.phone, canEditPrivate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setOk(false);
    setErr(null);

    try {
      if (!canSave) {
        return;
      }

      const cleanName = name.trim();
      const cleanUser = username.trim();
      const cleanBio = bio.trim();
      const { e164, error: phoneErr } = normalizePhoneIntl(phone);

      if (canEditPrivate && phoneErr) {
        throw new Error(phoneErr);
      }

      if (cleanUser && uCheck.available === false) {
        switch (uCheck.reason) {
          case 'length':
            throw new Error('O username deve ter entre 3 e 30 caracteres.');
          case 'format':
            throw new Error('O username só pode incluir letras, números, ponto, hífen ou underscore.');
          case 'taken':
            throw new Error('Este username já está em uso.');
          default:
            throw new Error('Verifica o username antes de guardar.');
        }
      }

      const payload: Record<string, unknown> = {};
      if (cleanName !== (baseline.name ?? '')) payload.name = cleanName || null;
      if (cleanBio !== (baseline.bio ?? '')) payload.bio = cleanBio || null;
      if (cleanUser !== (baseline.username ?? '')) payload.username = cleanUser || null;
      if (canEditPrivate && (e164 ?? null) !== (baseline.phone ?? null)) payload.phone = e164;

      if (!Object.keys(payload).length) {
        return;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 409 || data?.error === 'USERNAME_TAKEN') {
        setUCheck({ loading: false, available: false, reason: 'taken' });
        throw new Error('Este username já está em uso.');
      }

      if (!res.ok || data?.ok === false) {
        if (data?.reason === 'length') {
          throw new Error('O username deve ter entre 3 e 30 caracteres.');
        }
        if (data?.reason === 'format') {
          throw new Error('O username só pode incluir letras, números, ponto, hífen ou underscore.');
        }
        const message = typeof data?.error === 'string' ? data?.error : 'Falha ao guardar.';
        throw new Error(message);
      }

      const storedUsername = cleanUser ? cleanUser.toLowerCase() : '';
      const storedPhone = canEditPrivate ? (payload.phone !== undefined ? ((payload.phone as string | null) ?? null) : baseline.phone ?? null) : baseline.phone ?? null;

      setBaseline({
        name: cleanName,
        username: storedUsername,
        bio: cleanBio,
        phone: storedPhone,
      });

      setName(cleanName);
      setBio(cleanBio);
      setUsername(storedUsername);
      if (canEditPrivate && payload.phone !== undefined) setPhone(storedPhone ?? '');

      setOk(true);
    } catch (error: any) {
      setErr(error?.message ?? 'Não foi possível guardar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-xl" data-user-id={_userId}>
      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="profile-name">Nome completo</label>
        <input
          id="profile-name"
          className="auth-input w-full"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="O teu nome"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="profile-username">Username</label>
        <input
          id="profile-username"
          className="auth-input w-full"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ex.: joaosilva"
          autoComplete="off"
        />
        <p
          className="small"
          style={{ color: usernameInvalid ? 'var(--danger, #dc2626)' : 'var(--muted, #6b7280)' }}
        >
          {usernameHelper}
        </p>
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="profile-bio">Bio</label>
        <textarea
          id="profile-bio"
          className="auth-input w-full"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Fala-nos sobre ti"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="profile-phone">
          Telefone <span className="text-muted">(privado)</span>
        </label>
        <input
          id="profile-phone"
          className="auth-input w-full"
          type="tel"
          placeholder="+351 912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!canEditPrivate}
          inputMode="tel"
        />
        <p className="small text-muted">Guardado em formato internacional (+…). Visível apenas para ti, administradores e PT atribuído.</p>
        {phone && phoneInfo.error && (
          <p className="small" style={{ color: 'var(--danger, #dc2626)' }}>{phoneInfo.error}</p>
        )}
      </div>

      <div className="flex items-center gap-8">
        <button className="btn primary" disabled={busy || !canSave || usernameInvalid || Boolean(phoneInfo.error)}>
          {busy ? 'A guardar…' : 'Guardar'}
        </button>
        {ok && (
          <span className="chip" style={{ background: 'linear-gradient(135deg, var(--success), color-mix(in srgb, var(--success) 70%, black))' }}>
            Guardado!
          </span>
        )}
      </div>
      {err && <div className="badge-danger">{err}</div>}
    </form>
  );
}
