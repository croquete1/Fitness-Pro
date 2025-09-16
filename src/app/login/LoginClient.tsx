// src/app/login/LoginClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

const LOGO = process.env.NEXT_PUBLIC_APP_LOGO || '/assets/logo.png';

export default function LoginClient() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const canSubmit = identifier.trim().length > 0 && pw.length >= 6 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        identifier: identifier.trim(), // email OU username
        password: pw,
      });
      if (res?.error) setErr('Credenciais inválidas.');
      else router.push('/dashboard');
    } catch {
      setErr('Ocorreu um erro. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fp-auth min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        aria-labelledby="auth-title"
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
            <h1 id="auth-title" className="m-0 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Fitness Pro
            </h1>
            <p className="m-0 text-xs text-slate-500 dark:text-slate-400">Iniciar sessão</p>
          </div>
        </div>

        {/* fields */}
        <div className="grid gap-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email ou nome de utilizador
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              // sem placeholder para evitar CSS global antigo a “empurrar” o pseudo-elemento
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              Pode ser o email ou o username.
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
                className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm
                           hover:bg-slate-50 dark:hover:bg-slate-800/80"
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
            className="mt-1 w-full rounded-md bg-indigo-600 text-white py-2 font-semibold
                       hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'A entrar…' : 'Entrar'}
          </button>

          {err && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm px-3 py-2"
            >
              {err}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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

      {/* reset a estilos globais antigos que mexiam no ::placeholder, etc. */}
      <style jsx global>{`
        .fp-auth input::placeholder {
          position: static !important;
          background: transparent !important;
          padding: 0 !important;
          transform: none !important;
        }
      `}</style>

      {/* micro-anim acessível */}
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
