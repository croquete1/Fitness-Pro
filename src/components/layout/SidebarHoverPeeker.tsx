// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import React from 'react';
import { useSidebar } from './SidebarProvider';

export default function SidebarHoverPeeker() {
  const { open, setOpen } = useSidebar();

  // Se a sidebar estiver aberta (pinned), o peeker não é necessário.
  if (open) return null;

  return (
    <div
      // “faixa” de hover no lado esquerdo
      onMouseEnter={() => setOpen(true)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,                // fino e discreto
        height: '100dvh',
        zIndex: 40,
        background: 'transparent',
      }}
    >
      {/* Botão acessível para teclado/reader */}
      <button
        type="button"
        aria-label="Abrir navegação"
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: '50%',
          left: 10,
          transform: 'translateY(-50%)',
          borderRadius: 999,
          padding: 8,
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          cursor: 'pointer',
        }}
      >
        ☰
      </button>
    </div>
  );
}
