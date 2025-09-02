// src/components/layout/MobileTopBar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type Props = {
  title?: string;
  onToggleSidebar?: () => void;
};

export default function MobileTopBar({ title = 'Dashboard', onToggleSidebar }: Props) {
  // fallback no caso de não receberes o onToggleSidebar via layout
  const [fakeOpen, setFakeOpen] = useState(false);

  const toggle = () => {
    if (onToggleSidebar) onToggleSidebar();
    else setFakeOpen(v => !v);
  };

  return (
    <div
      className="
        md:hidden sticky top-[env(safe-area-inset-top)] z-40
        bg-white/80 dark:bg-neutral-900/70 backdrop-blur
        border-b border-neutral-200 dark:border-neutral-800
        px-4 pt-[env(safe-area-inset-top)] h-[56px] flex items-center gap-3
      "
      role="banner"
    >
      <button
        onClick={toggle}
        aria-label="Abrir menu"
        className="
          -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg
          border border-neutral-200 dark:border-neutral-800
          hover:bg-neutral-50 dark:hover:bg-neutral-800
          active:scale-[.98] transition
        "
      >
        {/* ícone hambúrguer */}
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <Link href="/dashboard/admin" className="font-semibold tracking-tight text-base">
        {title}
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {/* Espaço para uma ação rápida (ex.: criar) */}
        <Link
          href="/dashboard/admin/users"
          className="
            h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
            text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800
          "
        >
          Utilizadores
        </Link>
      </div>
    </div>
  );
}