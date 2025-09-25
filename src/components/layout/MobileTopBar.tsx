'use client';

import React from 'react';
import { useSidebar } from '@/components/layout/SidebarContext';

type Props = { title?: string; onToggleSidebar?: () => void };

export default function MobileTopBar({ title = 'Dashboard', onToggleSidebar }: Props) {
  const { toggle } = useSidebar();

  const handleToggle = () => {
    onToggleSidebar?.();
    toggle(); // em mobile abre/fecha, em desktop colapsa/expande
  };

  return (
    <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-3 py-2
                    border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <button className="btn" onClick={handleToggle} aria-label="Abrir menu">☰</button>
      <div className="font-semibold">{title}</div>
      <div style={{ width: 40 }} /> {/* spacer */}
    </div>
  );
}
