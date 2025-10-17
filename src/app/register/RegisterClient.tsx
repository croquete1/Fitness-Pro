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
    <div className="auth-screen" data-auth-root>
      <div className="auth-wrap">
        <div className="auth-card auth-simple">
          <div className="auth-simple__top">
            <div className="auth-simple__logo" aria-hidden>
              <BrandLogo size={56} />
            </div>
            <ThemeToggle variant="subtle" />
          </div>

          <div className="auth-simple__intro">
            <h1 className="auth-simple__title">Criar conta</h1>
            <p className="auth-simple__subtitle">Junta-te à equipa {brand.name}.</p>
          </div>

          {err && <Alert tone="danger" className="auth-simple__alert">{err}</Alert>}
          {ok && <Alert tone="success" className="auth-simple__alert">Conta criada! Já podes iniciar sessão.</Alert>}

          <form onSubmit={onSubmit} noValidate className="auth-simple__form">
            <label className="auth-simple__field">
              <span className="auth-simple__label">Nome</span>
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

            <label className="auth-simple__field">
              <span className="auth-simple__label">Email</span>
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

            <label className="auth-simple__field">
              <span className="auth-simple__label">Palavra-passe</span>
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
              className="auth-simple__submit"
              disabled={loading}
              loading={loading}
              loadingText="A criar…"
            >
              Criar conta
            </Button>
          </form>

          <p className="auth-simple__footnote">
            Já tens conta?{' '}
            <Link href="/login" className="auth-form__link auth-form__link--wavy">
              Inicia sessão
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
