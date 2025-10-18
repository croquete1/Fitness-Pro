// src/components/common/MobileFAB.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MobileFAB() {
  const [open, setOpen] = useState(false);
  return (
    <div className="neo-fab">
      {/* menu */}
      {open && (
        <div className="neo-fab__menu">
          <Link href="/dashboard/admin/users/new">Criar utilizador</Link>
          <Link href="/dashboard/admin/plans/new">Criar plano</Link>
        </div>
      )}

      {/* botão principal */}
      <button
        onClick={() => setOpen((value) => !value)}
        className="neo-fab__trigger"
        aria-label="Ações rápidas"
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}