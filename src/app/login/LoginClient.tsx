// src/app/login/LoginClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Logo from '@/components/layout/Logo';

export default function LoginClient() {
  const router = useRouter();

  // agora é "identifier": aceita email OU username
  const [identifier, setIdentifier] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = identifier.trim().length > 0 && pw.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,            // controlamos o redirect no cliente
        identifier: identifier.trim(),
        password: pw,
      });

      if (res?.error) {
        setErr('Credenciais inválidas.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setErr('Ocorreu um erro. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-6">
      <form
        onSubmit={onSubmit}
        aria-labelledby="auth-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-5 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Logo size={36} />
          <div>
            <h1 id="auth-title" className="m-0 text-lg sm:text-xl font-extrabold tracking-tight">
              Fitness Pro
            </h1>
            <p className="m-0 text-xs text-slate-500 dark:text-slate-400">Iniciar sessão</p>
          </div>
        </div>

        {/* Campos */}
        <div className="grid gap-3">
          <label className="text-sm font-medium">
            Email ou nome de utilizador
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="ex.: joana.silva ou joana@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
            />
          </label>

          <label className="text-sm font-medium">
            Palavra-passe
            <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
              <input
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-800"
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
            className="mt-1 w-full rounded-md bg-indigo-600 text-white py-2 font-semibold disabled:opacity-60"
          >
            {loading ? 'A entrar…' : 'Entrar'}
          </button>

          {err && (
            <div role="alert" className="rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm px-3 py-2">
              {err}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Link href="/login/forgot" className="text-sm text-indigo-600 hover:underline">
              Esqueceste-te da palavra-passe?
            </Link>
            <Link href="/register" className="text-sm text-indigo-600 hover:underline">
              Registar
            </Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Após o registo, a tua conta ficará pendente até aprovação por um administrador.
          </p>
        </div>
      </form>

      {/* micro-animação acessível */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          form {
            animation: fadeIn 0.2s ease-out both;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}
