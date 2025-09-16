// src/app/register/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LOGO = process.env.NEXT_PUBLIC_APP_LOGO || '/assets/logo.png';

export default function RegisterPage() {
  const [logoFailed, setLogoFailed] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // opcional
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = !!email && pw.length >= 6 && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setOk(null);
    setBusy(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim(),
          password: pw,
          username: username.trim() || null,
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.error || `Falha (HTTP ${res.status})`);
      }

      setOk('Conta criada. Aguarda aprovação do administrador.');
      setName(''); setEmail(''); setPw(''); setUsername('');
    } catch (e: any) {
      setErr(e?.message || 'Ocorreu um erro.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fp-auth min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        aria-labelledby="reg-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8"
      >
        {/* header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7">
          {!logoFailed ? (
            <Image
              src={LOGO}
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800 grid place-items-center font-bold">
              FP
            </div>
          )}
          <div>
            <h1 id="reg-title" className="m-0 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Fitness Pro
            </h1>
            <p className="m-0 text-xs text-slate-500 dark:text-slate-400">Criar conta</p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome (opcional)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome de utilizador (opcional)
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              3–30 chars, a-z 0-9 . _
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Palavra-passe
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="mt-1 w-full rounded-md bg-indigo-600 text-white py-2 font-semibold
                       hover:brightness-110 disabled:opacity-60"
          >
            {busy ? 'A criar…' : 'Criar conta'}
          </button>

          {ok && <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-2">{ok}</div>}
          {err && <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm px-3 py-2">{err}</div>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-sm text-slate-600 dark:text-slate-300">Já tens conta?</span>
            <Link href="/login" className="text-sm text-indigo-600 hover:underline">Entrar</Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Após o registo, a tua conta ficará pendente até aprovação por um administrador.
          </p>
        </div>
      </form>

      {/* reset a estilos globais antigos */}
      <style jsx global>{`
        .fp-auth input::placeholder {
          position: static !important;
          background: transparent !important;
          padding: 0 !important;
          transform: none !important;
        }
      `}</style>

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          form { animation: fadeIn .22s ease-out both; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
