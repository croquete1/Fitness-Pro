'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function ResetPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const oobCode = sp.get('code'); // supabase usa ?code no link de reset
  const sb = supabaseBrowser();

  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setOk(true);
      setTimeout(() => router.push('/login'), 1000);
    }
  }

  if (!oobCode) {
    return (
      <main className="p-6">
        <h1 className="font-bold text-xl">Ligação inválida</h1>
        <p className="text-slate-600">Tenta novamente a recuperação de palavra-passe.</p>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <h1 className="font-bold text-lg">Definir nova palavra-passe</h1>
        <input
          type="password"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
          placeholder="Nova palavra-passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button
          disabled={busy}
          className="w-full rounded-md bg-indigo-600 disabled:opacity-60 text-white py-2 font-semibold"
        >
          {busy ? 'A guardar…' : 'Guardar'}
        </button>
        {ok && <div className="text-green-600 text-sm">Atualizada com sucesso.</div>}
        {err && <div className="text-rose-600 text-sm">{err}</div>}
      </form>
    </main>
  );
}
