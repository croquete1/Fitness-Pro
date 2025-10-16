// src/app/login/LoginClient.tsx
'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
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
        icon: <Dumbbell className="h-5 w-5" aria-hidden />,
        title: 'Treinos adaptáveis',
        description: 'Planos ajustados em função da sessão e carga do atleta, sem fricção operacional.',
      },
      {
        icon: <Apple className="h-5 w-5" aria-hidden />,
        title: 'Nutrição flexível',
        description: 'Guias alimentares equilibrados com ajustes rápidos conforme objetivos e bem-estar.',
      },
      {
        icon: <Activity className="h-5 w-5" aria-hidden />,
        title: 'Biomarcadores claros',
        description: 'Indicadores essenciais organizados para consulta imediata, sem transbordar o cartão.',
      },
      {
        icon: <Users className="h-5 w-5" aria-hidden />,
        title: 'Agenda inteligente',
        description:
          'Clientes solicitam sessões, PTs aceitam ou remarcam e a plataforma impede conflitos presenciais.',
      },
    ],
    [],
  );

  return (
    <div className="auth-screen" data-auth-root>
      <div className="auth-card auth-card--split relative w-full max-w-6xl">
        <div className="auth-card__atmosphere" aria-hidden />
        <div className="auth-card__grid" aria-hidden />
        <div className="auth-card__scanline" aria-hidden />

        <div
          className={clsx(
            'pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-slate-900/70 text-white transition-opacity dark:bg-slate-950/70',
            loading ? 'opacity-100' : 'opacity-0',
            loading ? 'pointer-events-auto' : 'pointer-events-none',
          )}
          aria-hidden={!loading}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner size={36} />
            <p className="text-sm font-semibold tracking-wide uppercase">A iniciar sessão…</p>
          </div>
        </div>

        <div className="auth-card__layout">
          <div className="auth-card__panel relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 sm:p-8 lg:p-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] backdrop-blur-lg dark:border-slate-700/50 dark:bg-slate-950/85 dark:shadow-[0_70px_180px_-90px_rgba(37,99,235,0.55)] dark:backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(36%_44%_at_18%_20%,rgba(59,130,246,0.28),transparent_70%),radial-gradient(32%_36%_at_85%_18%,rgba(14,165,233,0.26),transparent_70%),radial-gradient(44%_60%_at_50%_120%,rgba(236,72,153,0.22),transparent_75%)] opacity-80 dark:hidden" />
            <div className="absolute inset-0 hidden opacity-90 mix-blend-screen dark:block bg-[radial-gradient(38%_48%_at_18%_18%,rgba(59,130,246,0.35),transparent_70%),radial-gradient(34%_40%_at_86%_22%,rgba(14,165,233,0.32),transparent_70%),radial-gradient(60%_80%_at_50%_115%,rgba(236,72,153,0.28),transparent_75%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="auth-panel__aura" aria-hidden />
              <div className="space-y-6 text-pretty sm:space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-700 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]" aria-hidden />
                  Plataforma HMS
                </div>
                <div className="space-y-4">
                  <h1 className="text-balance text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                    Plataforma premium para coordenar treinos, nutrição e agendamentos sem falhas.
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-200 sm:text-base">
                    Acompanha o progresso com dashboards refinados, planos inteligentes e um sistema de sessões que aceita pedidos, remarcações e bloqueia choques de agenda para clientes e PTs.
                  </p>
                </div>
                <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
                  {featureHighlights.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="auth-highlight"
                      style={{ animationDelay: `${index * 0.12}s` }}
                    >
                      <div className="auth-highlight__icon">{feature.icon}</div>
                      <div>
                        <p className="auth-highlight__title">{feature.title}</p>
                        <p className="auth-highlight__desc">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="auth-card__form relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-6 shadow-[0_38px_100px_-60px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-700/45 dark:bg-slate-950/90 dark:shadow-[0_70px_160px_-90px_rgba(59,130,246,0.55)] dark:backdrop-blur-2xl"
          >
            <div
              className="pointer-events-none absolute inset-0 hidden opacity-90 dark:block"
              aria-hidden
              style={{
                background:
                  'radial-gradient(42% 52% at 20% 18%, rgba(59,130,246,0.34), transparent 70%), radial-gradient(32% 48% at 80% 16%, rgba(14,165,233,0.28), transparent 72%), radial-gradient(62% 90% at 50% 118%, rgba(45,212,191,0.22), transparent 80%)',
              }}
            />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 text-[10px] font-bold text-white shadow-md shadow-indigo-500/40">
                  FP
                </span>
                Área reservada
              </div>
              <ThemeToggle />
            </div>
            <div className="relative z-10 space-y-3 text-pretty text-center">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 sm:text-3xl">Entrar</h2>
              <p className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-200">
                Gere planos, acompanha objetivos e mantém o diálogo com a tua comunidade em apenas alguns cliques.
              </p>
            </div>
            <div className="relative z-10 rounded-2xl border border-slate-200/60 bg-white/80 p-4 text-left shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="flex items-start gap-3">
                <span className="mt-1 grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-inner shadow-emerald-500/20 dark:bg-emerald-400/20 dark:text-emerald-200">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">Sessão protegida</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    Utilizamos encriptação AES-256 e verificação contínua para manter os teus dados e os do cliente seguros.
                  </p>
                </div>
              </div>
            </div>

            {err && <Alert tone="danger">{err}</Alert>}

            <div className="relative z-10 space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
                Email ou username
                <div className="relative">
                  <input
                    className={clsx('neo-input pl-12', fieldErr.identifier && 'neo-input--error')}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={(e) => validateField('identifier', e.target.value)}
                    autoComplete="email"
                    placeholder="ex: ana.lima"
                  />
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-200" aria-hidden />
                </div>
                <span className={clsx('neo-input__helper', fieldErr.identifier && 'text-danger')}>
                  {fieldErr.identifier ?? 'Indica o email ou username registado.'}
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
                Palavra-passe
                <div className="relative">
                  <input
                    className={clsx('neo-input pl-12 pr-14', fieldErr.password && 'neo-input--error')}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    onBlur={(e) => validateField('password', e.target.value)}
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="********"
                  />
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-200" aria-hidden />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-50"
                    aria-label={show ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
                <span className={clsx('neo-input__helper', fieldErr.password && 'text-danger')}>
                  {fieldErr.password ?? 'Mínimo 6 caracteres.'}
                </span>
              </label>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Recuperar acesso?{' '}
                  <Link
                    href="/login/reset"
                    className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4 dark:text-slate-100"
                  >
                    Definir nova palavra-passe
                  </Link>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-indigo-600 dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  SSO em breve
                </span>
              </div>

              <Button
                type="submit"
                className="w-full justify-center shadow-[0_24px_48px_-22px_rgba(79,70,229,0.65)] transition hover:shadow-[0_30px_60px_-24px_rgba(79,70,229,0.75)] dark:shadow-[0_28px_56px_-26px_rgba(59,130,246,0.55)]"
                loading={loading}
                loadingText="A iniciar…"
                leftIcon={<LogIn className="h-4 w-4" aria-hidden />}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
                disabled={!isFormValid}
              >
                Iniciar sessão
              </Button>
              <p className="text-pretty text-center text-sm text-slate-600 dark:text-slate-200">
                Não tens conta?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-slate-900 underline decoration-wavy underline-offset-4 dark:text-slate-100"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
