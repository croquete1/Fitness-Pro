// src/app/login/LoginClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';

export default function LoginClient() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = identifier.trim().length > 0 && pw.length >= 6 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      identifier: identifier.trim(), // email OU username
      password: pw,
    });
    setLoading(false);

    if (res?.error) setErr('Credenciais inválidas.');
    else router.push('/dashboard');
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* HERO */}
      <aside className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500" />
        <div className="absolute -top-16 -left-12 h-72 w-72 rounded-full blur-3xl opacity-40 bg-white/30" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl opacity-30 bg-fuchsia-400/40" />
        <div className="relative z-10 h-full w-full p-10 text-white flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={36} className="drop-shadow" />
            <span className="text-xl font-bold tracking-tight drop-shadow">Fitness Pro</span>
          </div>
          <div>
            <h2 className="mt-10 text-4xl font-extrabold leading-tight drop-shadow-sm">
              Treina melhor.<br />Vive melhor.
            </h2>
            <p className="mt-3 max-w-md text-white/90">
              Acompanha planos, sessões e progresso — tudo num só lugar, rápido e simples.
            </p>
          </div>
          <p className="text-xs text-white/70">© {new Date().getFullYear()} Fitness Pro</p>
        </div>
      </aside>

      {/* FORM */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={onSubmit}
          aria-labelledby="auth-title"
          className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8 animate-[fadeIn_.22s_ease-out_both]"
        >
          {/* header (mobile) */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 lg:hidden">
            <AppLogo size={40} />
            <div>
              <h1 id="auth-title" className="m-0 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                Fitness Pro
              </h1>
              <p className="m-0 text-xs text-slate-500 dark:text-slate-400">Iniciar sessão</p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email ou nome de utilizador
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                Podes usar o teu email ou o teu username.
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Palavra-passe
              <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
                <input
                  type={show ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80"
                  onClick={() => setShow((v) => !v)}
                  aria-pressed={show}
                  aria-label={show ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {show ? 'Esconder' : 'Mostrar'}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
              className="mt-1 w-full rounded-md bg-indigo-600 text-white py-2 font-semibold hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'A entrar…' : 'Entrar'}
            </button>

            {err && (
              <div role="alert" aria-live="assertive" className="rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm px-3 py-2">
                {err}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Link href="/login/forgot" className="text-sm text-indigo-600 hover:underline">Esqueceste-te da palavra-passe?</Link>
              <Link href="/register" className="text-sm text-indigo-600 hover:underline">Criar conta</Link>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Após o registo, a tua conta ficará pendente até aprovação por um administrador.
            </p>
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
