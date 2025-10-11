// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import type { Route } from 'next';

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const callbackUrl = '/dashboard' as Route; // alvo por omissão
  const canSubmit = identifier.trim().length > 0 && pw.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);

    // usamos redirect:false para controlar a navegação e manter typedRoutes
    const res = await signIn('credentials', {
      identifier,
      password: pw,
      redirect: false,
      callbackUrl, // ainda assim passamos para NextAuth saber o alvo
    });

    setLoading(false);

    if (!res) {
      setErr('Ocorreu um problema. Tenta novamente.');
      return;
    }
    if (res.error) {
      setErr('Credenciais inválidas.');
      return;
    }

    // se NextAuth devolveu URL (pode vir com origem completa), extraímos o pathname
    const target: Route = res.url
      ? (new URL(res.url, globalThis.location?.origin ?? 'http://localhost').pathname as Route)
      : callbackUrl;

    router.push(target);
  }

  return (
    <form onSubmit={onSubmit} className="auth-fields" style={{ display: 'grid', gap: 12 }}>
      <label className="auth-label" htmlFor="lemail">Email ou nome de utilizador</label>
      <input
        id="lemail"
        type="text"
        placeholder="utilizador ou email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
        className="auth-input"
      />
      <p className="text-sm" style={{ marginTop: -4, marginBottom: 4, color: 'var(--muted, #6b7280)' }}>
        Podes entrar com o teu email ou com o username escolhido no perfil.
      </p>

      <label className="auth-label" htmlFor="lpw">Palavra-passe</label>
      <div className="auth-password" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <input
          id="lpw"
          type={show ? 'text' : 'password'}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          className="auth-input"
        />
        <button
          type="button"
          className="btn"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
        >
          {show ? 'Esconder' : 'Mostrar'}
        </button>
      </div>

      {err && <div className="badge-danger" role="alert">{err}</div>}

      <button type="submit" className="btn primary" disabled={!canSubmit}>
        {loading ? 'A entrar…' : 'Entrar'}
      </button>

      <div className="auth-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Link href={'/login/forgot' as Route} className="btn link">Esqueceste-te da palavra-passe?</Link>
        <Link href={'/register' as Route} className="btn link">Registar</Link>
      </div>
    </form>
  );
}
