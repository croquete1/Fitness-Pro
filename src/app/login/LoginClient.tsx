// src/app/login/LoginClient.tsx
'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { toast } from '@/components/ui/Toaster';
import { AuthNeoShell } from '@/components/auth/AuthNeoShell';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Indica o email ou o username'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

function sanitizeNext(next?: string | null) {
  const fallback = '/dashboard';
  if (!next) return fallback;
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    if (!url.pathname.startsWith('/')) return fallback;
    if (url.pathname.startsWith('/login')) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    if (next.startsWith('/login')) return fallback;
    if (next.startsWith('/') && !next.startsWith('//')) return next;
    return fallback;
  }
}

function mapAuthError(code?: string | null) {
  if (!code) return null;
  const value = code.toLowerCase();
  if (value.includes('credential') || value.includes('signin')) return 'Credenciais inválidas.';
  if (value.includes('configuration')) return 'Erro de configuração do login.';
  if (value.includes('accessdenied')) return 'Acesso negado.';
  return 'Não foi possível iniciar sessão.';
}

export default function LoginClient() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const errParam = searchParams.get('error');

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{ identifier?: string; password?: string }>({});

  React.useEffect(() => {
    setError(mapAuthError(errParam));
  }, [errParam]);

  React.useEffect(() => {
    try {
      const last = localStorage.getItem('fp:lastIdentifier');
      if (last) setIdentifier(last);
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      const trimmed = identifier.trim();
      if (trimmed) {
        localStorage.setItem('fp:lastIdentifier', trimmed);
      } else {
        localStorage.removeItem('fp:lastIdentifier');
      }
    } catch {}
  }, [identifier]);

  const validateField = React.useCallback((key: 'identifier' | 'password', value: string) => {
    const schema = key === 'identifier' ? loginSchema.shape.identifier : loginSchema.shape.password;
    const result = schema.safeParse(value);
    setFieldErrors((prev) => ({ ...prev, [key]: result.success ? undefined : result.error.issues[0]?.message }));
    return result.success;
  }, []);

  const isFormValid = loginSchema.safeParse({ identifier, password }).success && !loading;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const nextErrors: { identifier?: string; password?: string } = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as 'identifier' | 'password';
        nextErrors[key] = issue.message;
      });
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const callbackUrl = sanitizeNext(nextParam);
      await signIn('credentials', {
        identifier: parsed.data.identifier,
        password: parsed.data.password,
        redirect: true,
        callbackUrl,
      });
    } catch (err) {
      console.error('[auth] signin failed', err);
      setError('Não foi possível iniciar sessão. Tenta novamente.');
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!error) return;
    toast(error, 2400, 'error');
  }, [error]);

  return (
    <AuthNeoShell
      title="Inicia sessão"
      subtitle="Acede ao painel com as tuas credenciais para continuar."
      footer={
        <p className="neo-auth__footnote">
          Ainda não tens acesso?{' '}
          <Link href="/register" className="neo-auth__link">
            Cria uma conta
          </Link>
        </p>
      }
    >
      {error ? (
        <Alert tone="danger" className="neo-auth__alert">
          {error}
        </Alert>
      ) : null}

      <form className="neo-auth__form" onSubmit={onSubmit} noValidate>
        <label className="neo-auth__field">
          <span className="neo-auth__label">Email ou username</span>
          <div className={clsx('neo-auth__inputWrap', fieldErrors.identifier && 'neo-auth__inputWrap--error')}>
            <Mail className="neo-auth__inputIcon" aria-hidden />
            <input
              className="neo-auth__input"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                if (fieldErrors.identifier) validateField('identifier', event.target.value);
              }}
              onBlur={(event) => validateField('identifier', event.target.value)}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>
          <span className={clsx('neo-auth__helper', fieldErrors.identifier && 'neo-auth__helper--error')}>
            {fieldErrors.identifier ?? 'Utiliza o email ou username registado.'}
          </span>
        </label>

        <label className="neo-auth__field">
          <span className="neo-auth__label">Palavra-passe</span>
          <div className={clsx('neo-auth__inputWrap', fieldErrors.password && 'neo-auth__inputWrap--error')}>
            <Lock className="neo-auth__inputIcon" aria-hidden />
            <input
              className="neo-auth__input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) validateField('password', event.target.value);
              }}
              onBlur={(event) => validateField('password', event.target.value)}
              autoComplete="current-password"
              minLength={6}
              required
            />
            <button
              type="button"
              className="neo-auth__reveal"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
            >
              {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </button>
          </div>
          <span className={clsx('neo-auth__helper', fieldErrors.password && 'neo-auth__helper--error')}>
            {fieldErrors.password ?? 'Mínimo 6 caracteres.'}
          </span>
        </label>

        <div className="neo-auth__formFooter">
          <Link href="/login/forgot" className="neo-auth__link">
            Esqueceste-te da palavra-passe?
          </Link>
          <Button
            type="submit"
            disabled={!isFormValid}
            loading={loading}
            leftIcon={<LogIn aria-hidden />}
            className="neo-auth__submit"
            loadingText="A iniciar sessão…"
          >
            Entrar
          </Button>
        </div>
      </form>
    </AuthNeoShell>
  );
}
