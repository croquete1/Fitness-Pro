// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import React from 'react';
import { useSidebar } from './SidebarProvider';

/**
 * Mostra uma “orelha” junto à sidebar quando ela está colapsada e não afixada.
 * Ao clicar, expande (toggleCollapsed).
 */
export default function SidebarHoverPeeker() {
  const { collapsed, pinned, toggleCollapsed } = useSidebar();

  // Só precisamos do peeker quando NÃO estiver afixada e estiver colapsada
  if (pinned || !collapsed) return null;

  return (
    <button
      type="button"
      aria-label="Abrir menu"
      title="Abrir menu"
      onClick={toggleCollapsed}
      style={{
        position: 'fixed',
        top: 72,
        left: 'calc(var(--sb-collapsed) - 6px)',
        zIndex: 70,
        width: 22,
        height: 46,
        borderRadius: '0 10px 10px 0',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 30px rgba(0,0,0,.08)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
      }}
    >
      <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>›</span>
    </button>
  );
}
