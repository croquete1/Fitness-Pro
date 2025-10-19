'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ShieldCheck, Lock } from 'lucide-react';

import { supabaseBrowser } from '@/lib/supabaseBrowser';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useLandingSummary } from '@/lib/public/landing/useLandingSummary';
import { AuthNeoShell } from '@/components/auth/AuthNeoShell';

function evaluatePassword(value: string) {
  const issues: string[] = [];
  if (value.length < 8) issues.push('min. 8');
  if (!/[A-Za-z]/.test(value)) issues.push('letra');
  if (!/\d/.test(value)) issues.push('número');
  return issues;
}

export default function ResetClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const supabase = supabaseBrowser();
  const { summary, isLoading } = useLandingSummary();

  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const issues = evaluatePassword(password);
  const valid = ready && issues.length === 0 && !loading;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code) {
        setError('Ligação inválida.');
        return;
      }
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;
      if (exchangeError) {
        setError('Ligação inválida ou expirada. Pede um novo email de recuperação.');
      } else {
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, supabase]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError('Não foi possível atualizar a palavra-passe. Tenta novamente.');
      return;
    }
    setSuccess('Atualizada com sucesso.');
    setTimeout(() => router.replace('/login'), 1200);
  }

  return (
    <AuthNeoShell
      title="Definir nova palavra-passe"
      subtitle="Garante a proteção dos teus dados e mantém a conta alinhada com a equipa."
      summary={summary}
      loadingSummary={isLoading}
      tone="notice"
      footer={
        <p className="neo-auth__footnote">
          Continua com dificuldades?{' '}
          <a href="mailto:support@fitness.pro" className="neo-auth__link">
            Contacta suporte
          </a>
        </p>
      }
    >
      {!ready && !error ? (
        <Alert tone="info" className="neo-auth__alert">
          A validar ligação…
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" className="neo-auth__alert">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert tone="success" className="neo-auth__alert">
          {success}
        </Alert>
      ) : null}

      <form className="neo-auth__form" onSubmit={onSubmit} noValidate>
        <label className="neo-auth__field">
          <span className="neo-auth__label">Nova palavra-passe</span>
          <div className={clsx('neo-auth__inputWrap', issues.length > 0 && password.length > 0 && 'neo-auth__inputWrap--error')}>
            <Lock className="neo-auth__inputIcon" aria-hidden />
            <input
              className="neo-auth__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={!ready || !!error}
              minLength={8}
              placeholder="********"
            />
          </div>
          <span className={clsx('neo-auth__helper', issues.length > 0 && password.length > 0 && 'neo-auth__helper--error')}>
            {password.length === 0
              ? 'Mínimo 8 caracteres com letras e números.'
              : issues.length > 0
                ? `Falta: ${issues.join(' · ')}`
                : 'Tudo ok!'}
          </span>
        </label>

        <Button
          type="submit"
          className="neo-auth__submit"
          disabled={!valid}
          loading={loading}
          loadingText="A guardar…"
          leftIcon={<ShieldCheck aria-hidden />}
        >
          Guardar
        </Button>
      </form>
    </AuthNeoShell>
  );
}
