// src/app/login/forgot/page.tsx
'use client';

import { useState } from 'react';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setOk(false);
    try {
      const r = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error(await r.text());
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Não foi possível enviar o email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">🔒</div>
          <div className="auth-title">Recuperar palavra-passe</div>
        </div>
        {ok ? (
          <p className="text-muted">
            Se o email existir, enviámos um link de recuperação. Verifica a tua caixa de entrada.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="auth-fields">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" className="auth-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            {err && <div className="badge-danger">{err}</div>}
            <div className="auth-actions">
              <button className="btn primary" disabled={busy}>{busy ? 'A enviar…' : 'Enviar link'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
