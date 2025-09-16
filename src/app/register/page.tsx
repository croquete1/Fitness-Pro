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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = !!email && pw.length >= 6 && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null); setOk(null); setBusy(true);
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
      if (!res.ok) throw new Error(data?.error || `Falha (HTTP ${res.status})`);
      setOk('Conta criada. Aguarda aprovação do administrador.');
      setName(''); setEmail(''); setPw(''); setUsername('');
    } catch (e: any) {
      setErr(e?.message || 'Ocorreu um erro.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* HERO igual ao login */}
      <aside className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500" />
        <div className="absolute -top-16 -left-12 h-72 w-72 rounded-full blur-3xl opacity-40 bg-white/30" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl opacity-30 bg-fuchsia-400/40" />
        <div className="relative z-10 h-full w-full p-10 text-white flex flex-col justify-between">
          <div className="flex items-center gap-3">
            {!logoFailed ? (
              <Image src={LOGO} alt="Logo" width={36} height={36} className="h-9 w-auto drop-shadow" priority onError={() => setLogoFailed(true)} />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-white/20 grid place-items-center font-bold">FP</div>
            )}
            <span className="text-xl font-bold tracking-tight drop-shadow">Fitness Pro</span>
          </div>
          <p className="text-xs text-white/70">© {new Date().getFullYear()} Fitness Pro</p>
        </div>
      </aside>

      {/* FORM */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={onSubmit}
          aria-labelledby="reg-title"
          className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8
                     animate-[fadeIn_.22s_ease-out_both]"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 lg:hidden">
            {!logoFailed ? (
              <Image src={LOGO} alt="Logo" width={40} height={40} className="h-10 w-auto" priority onError={() => setLogoFailed(true)} />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800 grid place-items-center font-bold">FP</div>
            )}
            <div>
              <h1 id="reg-title" className="m-0 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Fitness Pro</h1>
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
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Nome de utilizador (opcional)
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">3–30 chars, a-z 0-9 . _</span>
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
              className="mt-1 w-full rounded-md bg-indigo-600 text-white py-2 font-semibold hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'A criar…' : 'Criar conta'}
            </button>

            {ok && <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-2">{ok}</div>}
            {err && <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm px-3 py-2">{err}</div>}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-sm text-slate-600 dark:text-slate-300">Já tens conta?</span>
              <Link href="/login" className="text-sm text-indigo-600 hover:underline">Entrar</Link>
            </div>
          </div>
        </form>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
