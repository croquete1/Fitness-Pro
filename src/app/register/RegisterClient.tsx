// src/app/register/RegisterClient.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { z } from 'zod';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { toast } from '@/components/ui/Toaster';
import { brand } from '@/lib/brand';
import { RegisterSchema } from '@/lib/validation/auth';
import { AuthNeoShell } from '@/components/auth/AuthNeoShell';

export default function RegisterClient() {
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<{ name?: string; email?: string; password?: string }>({});

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

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = FormSchema.safeParse({ ...form });
    if (!parsed.success) {
      const nextErrors: { name?: string; email?: string; password?: string } = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as 'name' | 'email' | 'password';
        nextErrors[key] = issue.message;
      });
      setFieldErrors(nextErrors);
      toast('Verifica os campos destacados.', 2600, 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof json?.error === 'string' && json.error.length > 0 ? json.error : 'Falha no registo.';
        throw new Error(message);
      }
      setSuccess(true);
      toast('Conta criada com sucesso! 🎉', 2500, 'success');
      setForm({ name: '', email: '', password: '' });
    } catch (err: any) {
      const message = err?.message || 'Falha de rede.';
      setError(message);
      toast(message, 2500, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthNeoShell
      title="Criar conta"
      subtitle={`Preenche os teus dados para entrares no ecossistema ${brand.name}.`}
      footer={
        <p className="neo-auth__footnote">
          Já tens conta?{' '}
          <Link href="/login" className="neo-auth__link">
            Inicia sessão
          </Link>
        </p>
      }
    >
      {error ? (
        <Alert tone="danger" className="neo-auth__alert">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert tone="success" className="neo-auth__alert">
          Conta criada! Já podes iniciar sessão.
        </Alert>
      ) : null}

      <form className="neo-auth__form" onSubmit={onSubmit} noValidate>
        <label className="neo-auth__field">
          <span className="neo-auth__label">Nome completo</span>
          <div className={clsx('neo-auth__inputWrap', fieldErrors.name && 'neo-auth__inputWrap--error')}>
            <User className="neo-auth__inputIcon" aria-hidden />
            <input
              className="neo-auth__input"
              value={form.name}
              onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
              onBlur={(event) => {
                const result = FormSchema.pick({ name: true }).safeParse({ name: event.target.value });
                setFieldErrors((prev) => ({ ...prev, name: result.success ? undefined : result.error.issues[0]?.message }));
              }}
              autoComplete="name"
              required
            />
          </div>
          <span className={clsx('neo-auth__helper', fieldErrors.name && 'neo-auth__helper--error')}>
            {fieldErrors.name ?? 'Nome e apelido completos.'}
          </span>
        </label>

        <label className="neo-auth__field">
          <span className="neo-auth__label">Email</span>
          <div className={clsx('neo-auth__inputWrap', fieldErrors.email && 'neo-auth__inputWrap--error')}>
            <Mail className="neo-auth__inputIcon" aria-hidden />
            <input
              className="neo-auth__input"
              type="email"
              value={form.email}
              onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
              onBlur={(event) => {
                const result = FormSchema.pick({ email: true }).safeParse({ email: event.target.value });
                setFieldErrors((prev) => ({ ...prev, email: result.success ? undefined : result.error.issues[0]?.message }));
              }}
              autoComplete="email"
              required
            />
          </div>
          <span className={clsx('neo-auth__helper', fieldErrors.email && 'neo-auth__helper--error')}>
            {fieldErrors.email ?? 'Vamos enviar as notificações para este email.'}
          </span>
        </label>

        <label className="neo-auth__field">
          <span className="neo-auth__label">Palavra-passe</span>
          <div className={clsx('neo-auth__inputWrap', fieldErrors.password && 'neo-auth__inputWrap--error')}>
            <Lock className="neo-auth__inputIcon" aria-hidden />
            <input
              className="neo-auth__input"
              type="password"
              value={form.password}
              onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
              onBlur={(event) => {
                const result = FormSchema.pick({ password: true }).safeParse({ password: event.target.value });
                setFieldErrors((prev) => ({ ...prev, password: result.success ? undefined : result.error.issues[0]?.message }));
              }}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <span className={clsx('neo-auth__helper', fieldErrors.password && 'neo-auth__helper--error')}>
            {fieldErrors.password ?? 'Mínimo 6 caracteres.'}
          </span>
        </label>

        <Button
          type="submit"
          className="neo-auth__submit"
          disabled={loading}
          loading={loading}
          loadingText="A criar…"
          leftIcon={<UserPlus aria-hidden />}
          style={{
            backgroundColor: '#007bff', // Cor de fundo azul vibrante
            borderRadius: '8px', // Borda arredondada
            padding: '12px 24px', // Espaçamento interno maior
            fontSize: '16px', // Tamanho da fonte maior
            transition: 'background-color 0.5s ease, transform 0.5s ease', // Transições suaves com duração de 0.5s
            color: '#fff', // Cor do texto branca
            border: 'none', // Sem borda
            cursor: 'pointer', // Cursor ao passar o mouse
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#0056b3'; // Cor de fundo mais escura ao passar o mouse
            (e.target as HTMLElement).style.transform = 'scale(1.05)'; // Efeito de zoom ao passar o mouse
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#007bff'; // Cor de fundo original ao sair do mouse
            (e.target as HTMLElement).style.transform = 'scale(1)'; // Tamanho original ao sair do mouse
          }}
        >
          Criar conta
        </Button>
      </form>
    </AuthNeoShell>
  );
}