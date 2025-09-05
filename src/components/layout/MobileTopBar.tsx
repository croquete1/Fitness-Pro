'use client';

import React from 'react';
import { useSidebar } from './SidebarContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

type Props = {
  title?: string;
  onToggleSidebar?: () => void;
};

export default function MobileTopBar({ title = 'Dashboard', onToggleSidebar }: Props) {
  const { toggle } = useSidebar(); // ✅ agora existe no contexto

  const handleToggle = () => {
    if (onToggleSidebar) onToggleSidebar();
    else toggle();
  };

  return (
    <div
      className="card"
      style={{
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'saturate(180%) blur(6px)',
      }}
    >
      <button
        onClick={handleToggle}
        aria-label="Abrir/fechar menu"
        style={{
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.2)',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        ☰
      </button>

      <h1 style={{ margin: 0, fontSize: 18, flex: 1, textAlign: 'center' }}>{title}</h1>

      <ThemeToggle />
    </div>
  );
}
