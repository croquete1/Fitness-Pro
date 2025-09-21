// src/app/login/reset/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function ResetPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-sm opacity-70">A preparar a página…</div>
      </main>
    }>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const sb = supabaseBrowser();

  // Supabase pode enviar ?code, ?token_hash ou ?token
  const code = useMemo(
    () => sp.get('code') ?? sp.get('token_hash') ?? sp.get('token'),
    [sp]
  );

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Trocar code por sessão antes de permitir updateUser
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!code) { setReady(false); return; }
      setBusy(true);
      setErr(null);
      try {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (!cancelled) {
          if (error) {
            setErr('Ligação inválida ou expirada. Pede um novo email de recuperação.');
            setReady(false);
          } else {
            setReady(true);
          }
        }
      } catch {
        if (!cancelled) {
          setErr('Ocorreu um erro ao validar a ligação.');
          setReady(false);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [code, sb]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    if (password.trim().length < 6) {
      setErr('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { error } = await sb.auth.updateUser({ password });
      if (error) {
        setErr('Não foi possível atualizar a palavra-passe. Tenta novamente.');
      } else {
        // ⬇️ sincroniza o hash na nossa tabela "users" (NextAuth)
        await fetch('/api/auth/update-password-hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        }).catch(() => { /* não bloquear o fluxo */ });

        setOk(true);
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch {
      setErr('Ocorreu um erro inesperado.');
    } finally {
      setBusy(false);
    }
  }

  if (!code) {
    return (
      <main className="p-6">
        <h1 className="font-bold text-xl">Ligação inválida</h1>
        <p className="text-slate-600">
          Não encontrámos um código válido. Pede novamente a recuperação de palavra-passe.
        </p>
        <button className="btn chip mt-3" onClick={() => router.push('/login')}>
          ⟵ Voltar ao login
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-3 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
      >
        <h1 className="font-bold text-lg">Definir nova palavra-passe</h1>

        {!ready && !err && (
          <div className="text-sm opacity-80">A validar a tua ligação…</div>
        )}

        <label className="block">
          <span className="sr-only">Nova palavra-passe</span>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
            placeholder="Nova palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={!ready || busy}
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={!ready || busy}
          className="w-full rounded-md bg-indigo-600 disabled:opacity-60 text-white py-2 font-semibold"
        >
          {busy ? 'A guardar…' : 'Guardar'}
        </button>

        {ok && <div className="text-green-600 text-sm">Atualizada com sucesso.</div>}
        {err && <div className="text-rose-600 text-sm">{err}</div>}
      </form>
    </main>
  );
}
