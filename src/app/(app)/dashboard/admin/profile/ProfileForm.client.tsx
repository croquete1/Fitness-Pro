'use client';

import React, { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

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

export default function ProfileForm({ userId, initial, canEditPrivate = true }: Props) {
  const sb = supabaseBrowser();

  const [name, setName] = useState(initial?.name ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOk(false);
    setErr(null);

    try {
      const sba = sb as any;

      const cleanUser = username.trim() || null;
      const cleanName = name.trim() || null;
      const cleanBio = bio.trim() || null;

      // telefone
      const { e164, error: phoneErr } = normalizePhoneIntl(phone);
      if (phoneErr) throw new Error(phoneErr);

      // username único (ignora o próprio)
      if (cleanUser) {
        const { data: clash, error: clashErr } = await sba
          .from('profiles')
          .select('id')
          .eq('username', cleanUser)
          .neq('id', userId)
          .limit(1)
          .maybeSingle();

        if (clashErr) throw clashErr;
        if (clash) throw new Error('Este nome de utilizador já está em uso.');
      }

      // update públicos
      const { error: upErr } = await sba
        .from('profiles')
        .update({ name: cleanName, username: cleanUser, bio: cleanBio })
        .eq('id', userId);
      if (upErr) throw upErr;

      // privado (phone em E.164)
      if (canEditPrivate) {
        const { error: privErr } = await sba
          .from('profile_private')
          .upsert({ user_id: userId, phone: e164 }, { onConflict: 'user_id' });
        if (privErr) throw privErr;
      }

      setOk(true);
    } catch (e: any) {
      setErr(e?.message ?? 'Falha ao guardar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
      {/* … campos iguais aos anteriores … */}
      <div className="grid gap-1">
        <label className="text-sm font-medium">
          Telefone <span className="text-muted">(privado)</span>
        </label>
        <input
          className="auth-input w-full"
          type="tel"
          placeholder="+351 912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!canEditPrivate}
          inputMode="tel"
        />
        <p className="small text-muted">Guardado em formato internacional (+…). Visível para ti, admin e PT atribuído.</p>
      </div>

      <div className="flex items-center gap-8">
        <button className="btn primary" disabled={busy}>
          {busy ? 'A guardar…' : 'Guardar'}
        </button>
        {ok && <span className="chip" style={{ background: 'linear-gradient(135deg, var(--success), color-mix(in srgb, var(--success) 70%, black))' }}>Guardado!</span>}
      </div>
      {err && <div className="badge-danger">{err}</div>}
    </form>
  );
}
