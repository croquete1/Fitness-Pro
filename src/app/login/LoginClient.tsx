// src/app/login/LoginClient.tsx
'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Activity,
  Apple,
  Dumbbell,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Indica o email ou o username'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

function sanitizeNext(next?: string | null) {
  const fallback = '/dashboard';
  if (!next) return fallback;
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const u = new URL(next, base);
    const path = u.pathname + (u.search || '') + (u.hash || '');
    if (u.origin !== base) return fallback;
    if (path.startsWith('/login')) return fallback;
    if (path.startsWith('/') && !path.startsWith('//')) return path || fallback;
  } catch {
    if (next.startsWith('/login')) return fallback;
    if (next.startsWith('/') && !next.startsWith('//')) return next;
  }
  return fallback;
}

function mapAuthError(code?: string | null) {
  if (!code) return null;
  const c = code.toLowerCase();
  if (c.includes('credential') || c.includes('signin')) return 'Credenciais inválidas.';
  if (c.includes('configuration')) return 'Erro de configuração do login.';
  if (c.includes('accessdenied')) return 'Acesso negado.';
  return 'Não foi possível iniciar sessão.';
}

export default function LoginClient() {
  const sp = useSearchParams();
  const nextParam = sp.get('next');
  const errParam = sp.get('error');

  const [identifier, setIdentifier] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<{ identifier?: string; password?: string }>({});

  React.useEffect(() => { setErr(mapAuthError(errParam)); }, [errParam]);
  React.useEffect(() => {
    try {
      const last =
        localStorage.getItem('fp:lastIdentifier') ?? localStorage.getItem('fp:lastEmail');
      if (last) setIdentifier(last);
      if (localStorage.getItem('fp:lastEmail')) localStorage.removeItem('fp:lastEmail');
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

  const validateField = (key: 'identifier' | 'password', value: string) => {
    const schema = key === 'identifier' ? loginSchema.shape.identifier : loginSchema.shape.password;
    const res = schema.safeParse(value);
    setFieldErr((prev) => ({ ...prev, [key]: res.success ? undefined : res.error.issues[0]?.message }));
    return res.success;
  };

  const isFormValid = loginSchema.safeParse({ identifier, password: pw }).success && !loading;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    const parsed = loginSchema.safeParse({ identifier, password: pw });
    if (!parsed.success) {
      const nextErrors: any = {};
      for (const i of parsed.error.issues) nextErrors[i.path[0] as string] = i.message;
      setFieldErr(nextErrors);
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
    } catch {
      setErr('Não foi possível iniciar sessão. Tenta novamente.');
      setLoading(false);
    }
  }

  const featureHighlights = React.useMemo(
    () => [
      {
        icon: <Dumbbell className="h-6 w-6" aria-hidden />,
        title: 'Treinos adaptáveis',
        description: 'Personal trainers ajustam sessões e clientes acompanham resultados em tempo real.',
      },
      {
        icon: <Apple className="h-6 w-6" aria-hidden />,
        title: 'Nutrição integrada',
        description: 'Planos alimentares partilhados com feedback imediato entre coach e cliente.',
      },
      {
        icon: <Activity className="h-6 w-6" aria-hidden />,
        title: 'Biomarcadores claros',
        description: 'Indicadores essenciais organizados num painel simples para ambos os lados.',
      },
      {
        icon: <Users className="h-6 w-6" aria-hidden />,
        title: 'Agenda inteligente',
        description: 'Pedidos, confirmações e remarcações sincronizados sem conflitos presenciais.',
      },
    ],
    [],
  );

  return (
    <div className="auth-screen" data-auth-root>
      <div className="auth-card auth-card--split">
        <div className="auth-card__atmosphere" aria-hidden />
        <div className="auth-card__grid" aria-hidden />
        <div className="auth-card__scanline" aria-hidden />

        <div className="auth-card__loader" data-active={loading} aria-hidden={!loading}>
          <div className="auth-card__loaderInner">
            <Spinner size={36} />
            <p className="auth-card__loaderLabel">A iniciar sessão…</p>
          </div>
        </div>

        <div className="auth-card__layout">
          <section className="auth-card__panel auth-panel" aria-label="Visão geral da plataforma HMS">
            <div className="auth-panel__aura" aria-hidden />
            <div className="auth-panel__content">
              <div className="auth-panel__badge">
                <span className="auth-panel__badgeLogo" aria-hidden>
                  <Image
                    src="/brand/hms-logo-light.png"
                    alt="HMS"
                    width={64}
                    height={64}
                    className="auth-panel__logo auth-panel__logo--light"
                    priority
                  />
                  <Image
                    src="/brand/hms-logo-dark.png"
                    alt="HMS"
                    width={64}
                    height={64}
                    className="auth-panel__logo auth-panel__logo--dark"
                    priority
                  />
                  <span className="auth-panel__status" />
                </span>
                <span className="auth-panel__badgeLabel">Plataforma HMS</span>
              </div>

              <div className="auth-panel__intro">
                <h1 className="auth-panel__title">
                  A plataforma unificada para personal trainers e clientes HMS.
                </h1>
                <p className="auth-panel__desc">
                  Centraliza treinos, nutrição e conversas num espaço único com sincronização automática de sessões presenciais.
                </p>
              </div>

              <div className="auth-panel__features">
                {featureHighlights.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="auth-highlight"
                    style={{ animationDelay: `${index * 0.12}s` }}
                  >
                    <div className="auth-highlight__icon">{feature.icon}</div>
                    <div className="auth-highlight__copy">
                      <p className="auth-highlight__title">{feature.title}</p>
                      <p className="auth-highlight__desc">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <form className="auth-form" onSubmit={onSubmit} noValidate aria-label="Formulário de autenticação">
            <div className="auth-form__halo" aria-hidden />

            <header className="auth-form__header">
              <div className="auth-form__badge">
                <span className="auth-form__badgeLogo" aria-hidden>
                  <Image
                    src="/brand/hms-logo-light.png"
                    alt="HMS"
                    width={56}
                    height={56}
                    className="auth-form__badgeImage auth-form__badgeImage--light"
                    priority
                  />
                  <Image
                    src="/brand/hms-logo-dark.png"
                    alt="HMS"
                    width={56}
                    height={56}
                    className="auth-form__badgeImage auth-form__badgeImage--dark"
                    priority
                  />
                </span>
                <span className="auth-form__badgeLabel">Hub unificado</span>
              </div>
              <ThemeToggle className="auth-form__themeToggle" variant="subtle" />
            </header>

            <div className="auth-form__intro">
              <h2 className="auth-form__title">Entrar</h2>
              <p className="auth-form__subtitle">
                Liga personal trainers e clientes na mesma experiência para gerir treinos, metas e comunicação contínua.
              </p>
            </div>

            <div className="auth-form__assurance" role="status">
              <span className="auth-form__assuranceIcon" aria-hidden>
                <ShieldCheck className="auth-form__assuranceSvg" aria-hidden />
              </span>
              <div className="auth-form__assuranceCopy">
                <p className="auth-form__assuranceTitle">Sessão protegida</p>
                <p className="auth-form__assuranceDesc">
                  Utilizamos encriptação AES-256 e verificação contínua para manter os teus dados e os do cliente seguros.
                </p>
              </div>
            </div>

            {err && <Alert tone="danger" className="auth-form__alert">{err}</Alert>}

            <div className="auth-form__fields">
              <label className="auth-form__field">
                <span className="auth-form__label">Email ou username</span>
                <div className="auth-form__inputWrapper">
                  <input
                    className={clsx('neo-input neo-input--with-leadingIcon', fieldErr.identifier && 'neo-input--error')}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={(e) => validateField('identifier', e.target.value)}
                    autoComplete="email"
                    placeholder="ex: ana.lima"
                  />
                  <span className="neo-input__icon">
                    <Mail className="auth-form__inputIcon" aria-hidden />
                  </span>
                </div>
                <span className={clsx('neo-input__helper', fieldErr.identifier && 'text-danger')}>
                  {fieldErr.identifier ?? 'Indica o email ou username registado.'}
                </span>
              </label>

              <label className="auth-form__field">
                <span className="auth-form__label">Palavra-passe</span>
                <div className="auth-form__inputWrapper">
                  <input
                    className={clsx(
                      'neo-input neo-input--with-leadingIcon neo-input--with-trailingIcon',
                      fieldErr.password && 'neo-input--error',
                    )}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    onBlur={(e) => validateField('password', e.target.value)}
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="********"
                  />
                  <span className="neo-input__icon">
                    <Lock className="auth-form__inputIcon" aria-hidden />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="neo-input__toggle auth-form__toggle"
                    aria-label={show ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {show ? <EyeOff className="auth-form__inputIcon" aria-hidden /> : <Eye className="auth-form__inputIcon" aria-hidden />}
                  </button>
                </div>
                <span className={clsx('neo-input__helper', fieldErr.password && 'text-danger')}>
                  {fieldErr.password ?? 'Mínimo 6 caracteres.'}
                </span>
              </label>
            </div>

            <div className="auth-form__links">
              <span className="auth-form__linkGroup">
                Recuperar acesso?{' '}
                <Link href="/login/reset" className="auth-form__link auth-form__link--dotted">
                  Definir nova palavra-passe
                </Link>
              </span>
              <span className="auth-form__tag">
                <Sparkles className="auth-form__tagIcon" aria-hidden />
                SSO em breve
              </span>
            </div>

            <Button
              type="submit"
              className="auth-form__submit"
              loading={loading}
              loadingText="A iniciar…"
              leftIcon={<LogIn aria-hidden className="auth-form__buttonIcon" />}
              rightIcon={<ArrowRight aria-hidden className="auth-form__buttonIcon" />}
              disabled={!isFormValid}
            >
              Iniciar sessão
            </Button>

            <p className="auth-form__footnote">
              Não tens conta?{' '}
              <Link href="/register" className="auth-form__link auth-form__link--wavy">
                Criar conta
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
