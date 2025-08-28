'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutConfirmButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function doSignOut() {
    setBusy(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Sair
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
          onClick={(e) => e.currentTarget === e.target && setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border bg-white p-4 shadow-xl">
            <h3 className="mb-2 text-base font-semibold">Terminar sessão?</h3>
            <p className="text-sm text-gray-600">
              Vais sair da tua conta. Queres mesmo continuar?
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="btn"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancelar
              </button>
              <button
                className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
                onClick={doSignOut}
                disabled={busy}
              >
                {busy ? 'A sair…' : 'Terminar sessão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
