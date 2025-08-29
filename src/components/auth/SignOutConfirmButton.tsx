'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutConfirmButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        Sair
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
          onClick={(e) => e.currentTarget === e.target && setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border bg-white p-4 shadow-xl dark:bg-[#0e151d]">
            <h3 className="mb-2 text-lg font-semibold">Terminar sessão?</h3>
            <p className="text-sm opacity-80">
              Vais sair da tua conta. Queres mesmo continuar?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button
                className="btn"
                style={{
                  background: 'var(--danger)',
                  color: 'var(--on-danger)',
                  borderColor: 'var(--danger)',
                }}
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Terminar sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
