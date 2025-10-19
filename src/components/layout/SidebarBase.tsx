'use client';

import * as React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Props = { header?: React.ReactNode; children?: React.ReactNode };

export default function SidebarBase({ header, children }: Props) {
  const { collapsed, isMobile, mobileOpen, closeMobile, toggleCollapse, peek, setPeek } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;
  const width = isMobile ? 'min(92vw, 340px)' : isRail ? 'var(--neo-sidebar-width-rail)' : 'var(--neo-sidebar-width)';

  const hoverHandlers = !isMobile && collapsed
    ? {
        onMouseEnter: () => setPeek(true),
        onMouseLeave: () => setPeek(false),
        onFocus: () => setPeek(true),
        onBlur: () => setPeek(false),
      }
    : {};

  const aside = (
    <aside
      className={clsx('neo-sidebar', isRail && 'neo-sidebar--rail', peek && 'neo-sidebar--peek')}
      style={{ width }}
      data-state={isRail ? 'rail' : 'panel'}
      {...hoverHandlers}
    >
      <div className="neo-sidebar__header">
        <div className="neo-sidebar__title">{header}</div>
        {!isMobile && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="neo-sidebar__collapse"
            aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
            aria-pressed={collapsed}
          >
            <span aria-hidden>
              {collapsed ? <ChevronRight size={16} strokeWidth={2} /> : <ChevronLeft size={16} strokeWidth={2} />}
            </span>
          </button>
        )}
      </div>
      <div className="neo-sidebar__content">{children}</div>
    </aside>
  );

  if (isMobile) {
    if (!mobileOpen) return null;
    return (
      <div className="neo-sidebar__overlay" role="dialog" aria-modal="true" onClick={closeMobile}>
        <div className="neo-sidebar__sheet" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="neo-sidebar__close"
            onClick={closeMobile}
            aria-label="Fechar navegação"
          >
            <X size={16} strokeWidth={2} aria-hidden />
          </button>
          {aside}
        </div>
      </div>
    );
  }

  return aside;
}
