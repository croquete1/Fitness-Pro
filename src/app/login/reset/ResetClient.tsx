'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

function pwIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('min. 8');
  if (!/[A-Za-z]/.test(pw)) issues.push('letra');
  if (!/\d/.test(pw)) issues.push('número');
  return issues;
}

export default function ResetClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const code = sp.get('code');
  const sb = supabaseBrowser();

  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const issues = pwIssues(password);
  const valid = ready && issues.length === 0 && !busy;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code) {
        setErr('Ligação inválida.');
        return;
      }
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (cancelled) return;
      if (error) setErr('Ligação inválida ou expirada. Pede um novo email de recuperação.');
      else setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, sb]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErr('Não foi possível atualizar a palavra-passe. Tenta novamente.');
      return;
    }
    setOk('Atualizada com sucesso.');
    setTimeout(() => router.replace('/login'), 1200);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card relative w-full max-w-xl">
        <div className="absolute right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-[0_38px_100px_-60px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/60">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
              <BrandLogo size={48} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Definir nova palavra-passe</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Introduz a tua nova palavra-passe para concluires a recuperação.
            </p>
          </div>

          {!ready && !err && <Alert tone="info">A validar ligação…</Alert>}
          {err && <Alert tone="danger">{err}</Alert>}
          {ok && <Alert tone="success">{ok}</Alert>}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Nova palavra-passe
              <input
                className={clsx('neo-input', issues.length > 0 && password.length > 0 && 'neo-input--error')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!ready || !!err}
                minLength={8}
                placeholder="********"
              />
              <span className={clsx('neo-input__helper', issues.length > 0 && 'text-danger')}>
                {password.length === 0
                  ? 'Mínimo 8 caracteres com letras e números.'
                  : issues.length > 0
                    ? `Falta: ${issues.join(' · ')}`
                    : 'Tudo ok!'}
              </span>
            </label>

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={!valid}
              loading={busy}
              loadingText="A guardar…"
            >
              Guardar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
