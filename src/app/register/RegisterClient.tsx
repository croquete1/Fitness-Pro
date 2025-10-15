// src/app/register/RegisterClient.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { z } from 'zod';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { toast } from '@/components/ui/Toaster';
import { brand } from '@/lib/brand';
import { RegisterSchema } from '@/lib/validation/auth';

export default function RegisterClient() {
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const [fieldErr, setFieldErr] = React.useState<{ name?: string; email?: string; password?: string }>({});
  const FormSchema = React.useMemo(
    () =>
      RegisterSchema.extend({
        name: z
          .string()
          .min(1, 'Nome é obrigatório.')
          .min(2, 'Nome muito curto.')
          .max(100, 'Nome muito longo.'),
        email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
        password: z
          .string()
          .min(1, 'Palavra-passe obrigatória.')
          .min(6, 'Mínimo 6 caracteres.'),
      }),
    [],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setFieldErr({});
    const parsed = FormSchema.safeParse({ ...form });
    if (!parsed.success) {
      const nextErrors: { name?: string; email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'name' | 'email' | 'password' | undefined;
        if (key) nextErrors[key] = issue.message;
      }
      setFieldErr(nextErrors);
      toast('Verifica os campos destacados.', 2600, 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...parsed.data }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = typeof j?.error === 'string' && j.error.length > 0 ? j.error : 'Falha no registo.';
        throw new Error(message);
      }
      setOk(true);
      toast('Conta criada com sucesso! 🎉', 2500, 'success');
      setForm({ name: '', email: '', password: '' });
    } catch (error: any) {
      const message = error?.message || 'Falha de rede.';
      setErr(message);
      toast(message, 2500, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card relative w-full max-w-xl">
        <div className="absolute right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-[0_38px_100px_-60px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/60">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
              <BrandLogo size={56} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Criar conta</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Junta-te à equipa {brand.name}.</p>
          </div>

          {err && <Alert tone="danger">{err}</Alert>}
          {ok && <Alert tone="success">Conta criada! Já podes iniciar sessão.</Alert>}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Nome
              <input
                className={clsx('neo-input', fieldErr.name && 'neo-input--error')}
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                onBlur={(e) => {
                  const res = FormSchema.pick({ name: true }).safeParse({ name: e.target.value });
                  setFieldErr((prev) => ({ ...prev, name: res.success ? undefined : res.error.issues[0]?.message }));
                }}
                autoComplete="name"
                required
              />
              <span className={clsx('neo-input__helper', fieldErr.name && 'text-danger')}>
                {fieldErr.name ?? 'Nome e apelido completos.'}
              </span>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Email
              <input
                className={clsx('neo-input', fieldErr.email && 'neo-input--error')}
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                onBlur={(e) => {
                  const res = FormSchema.pick({ email: true }).safeParse({ email: e.target.value });
                  setFieldErr((prev) => ({ ...prev, email: res.success ? undefined : res.error.issues[0]?.message }));
                }}
                autoComplete="email"
                required
              />
              <span className={clsx('neo-input__helper', fieldErr.email && 'text-danger')}>
                {fieldErr.email ?? 'Vamos enviar as notificações para este email.'}
              </span>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Palavra-passe
              <input
                className={clsx('neo-input', fieldErr.password && 'neo-input--error')}
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                onBlur={(e) => {
                  const res = FormSchema.pick({ password: true }).safeParse({ password: e.target.value });
                  setFieldErr((prev) => ({ ...prev, password: res.success ? undefined : res.error.issues[0]?.message }));
                }}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <span className={clsx('neo-input__helper', fieldErr.password && 'text-danger')}>
                {fieldErr.password ?? 'Mínimo 6 caracteres.'}
              </span>
            </label>

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={loading}
              loading={loading}
              loadingText="A criar…"
            >
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Já tens conta?{' '}
            <Link href="/login" className="font-semibold text-slate-900 underline decoration-wavy underline-offset-4 dark:text-slate-100">
              Inicia sessão
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
