// src/app/login/reset/page.tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import Link from 'next/link';
import type { Route } from 'next';

export default function ResetPage() {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) throw error;
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Não foi possível atualizar a palavra-passe.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">🔑</div>
          <div className="auth-title">Definir nova palavra-passe</div>
        </div>

        {ok ? (
          <>
            <p>Palavra-passe atualizada com sucesso.</p>
            <Link className="btn primary" href={'/login' as Route}>Voltar ao login</Link>
          </>
        ) : (
          <form onSubmit={onSubmit} className="auth-fields">
            <label className="auth-label" htmlFor="pw">Nova palavra-passe</label>
            <input id="pw" className="auth-input" type="password" minLength={8} value={pw} onChange={e=>setPw(e.target.value)} required />
            {err && <div className="badge-danger">{err}</div>}
            <div className="auth-actions">
              <button className="btn primary" disabled={busy || pw.length < 8}>
                {busy ? 'A gravar…' : 'Gravar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
