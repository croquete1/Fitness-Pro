// src/components/common/MobileFAB.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MobileFAB() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-40">
      {/* menu */}
      {open && (
        <div className="mb-2 w-48 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
          <Link href="/dashboard/admin/users/new" className="block px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Criar utilizador</Link>
          <Link href="/dashboard/admin/plans/new" className="block px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Criar plano</Link>
        </div>
      )}

      {/* botão principal */}
      <button
        onClick={() => setOpen(v => !v)}
        className="h-12 w-12 rounded-full shadow-lg bg-black text-white dark:bg-white dark:text-black grid place-items-center active:scale-[.98] transition"
        aria-label="Ações rápidas"
      >
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}