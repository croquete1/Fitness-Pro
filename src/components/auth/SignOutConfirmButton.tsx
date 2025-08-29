'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import * as ReactDOM from 'react-dom';

export default function SignOutConfirmButton() {
  const [open, setOpen] = useState(false);

  const overlay =
    typeof window !== 'undefined'
      ? ReactDOM.createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.currentTarget === e.target && setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'grid',
              placeItems: 'center',
              padding: 16,
              background: 'rgba(0,0,0,.35)',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 440,
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                color: 'var(--text)',
                boxShadow: '0 10px 25px rgba(0,0,0,.25)',
                padding: 16,
              }}
            >
              <h3 style={{ margin: '0 0 6px 0' }}>Terminar sessão?</h3>
              <p style={{ margin: 0, opacity: 0.85 }}>
                Vais sair da tua conta. Queres mesmo continuar?
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button className="btn danger" onClick={() => signOut({ callbackUrl: '/login' })}>
                  Terminar sessão
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        Sair
      </button>
      {open && overlay}
    </>
  );
}
