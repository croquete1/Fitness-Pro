// src/components/layout/MobileTopBar.tsx
'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Props = {
  title?: string;
  onToggleSidebar?: () => void;
};

export default function MobileTopBar({ title = 'Dashboard', onToggleSidebar }: Props) {
  const { mobileOpen, openMobile, closeMobile } = useSidebar();

  const handleToggle = React.useCallback(() => {
    onToggleSidebar?.();
    if (mobileOpen) {
      closeMobile();
    } else {
      openMobile(true);
    }
  }, [closeMobile, mobileOpen, onToggleSidebar, openMobile]);

  return (
    <header className="neo-mobile-topbar" role="banner" data-open={mobileOpen ? 'true' : 'false'}>
      <div className="neo-mobile-topbar__inner">
        <button
          type="button"
          className="neo-mobile-topbar__trigger"
          onClick={handleToggle}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen ? 'true' : 'false'}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <span className="neo-mobile-topbar__title">{title}</span>
      </div>
    </header>
  );
}
