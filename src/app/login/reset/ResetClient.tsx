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
    <div className="auth-screen" data-auth-root>
      <div className="auth-wrap">
        <div className="auth-card auth-simple">
          <div className="auth-simple__top">
            <div className="auth-simple__logo" aria-hidden>
              <BrandLogo size={48} />
            </div>
            <ThemeToggle variant="subtle" />
          </div>

          <div className="auth-simple__intro">
            <h1 className="auth-simple__title">Definir nova palavra-passe</h1>
            <p className="auth-simple__subtitle">
              Introduz a tua nova palavra-passe para concluires a recuperação.
            </p>
          </div>

          {!ready && !err && <Alert tone="info" className="auth-simple__alert">A validar ligação…</Alert>}
          {err && <Alert tone="danger" className="auth-simple__alert">{err}</Alert>}
          {ok && <Alert tone="success" className="auth-simple__alert">{ok}</Alert>}

          <form onSubmit={onSubmit} className="auth-simple__form" noValidate>
            <label className="auth-simple__field">
              <span className="auth-simple__label">Nova palavra-passe</span>
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
              className="auth-simple__submit"
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
