'use client';

import { useEffect } from 'react';

export default function SbToggle() {
  // aplicar estado guardado logo no arranque
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sb-collapsed');
      if (saved === '0' || saved === '1') {
        document.documentElement.setAttribute('data-sb-collapsed', saved);
      }
    } catch {}
  }, []);

  const onToggle = () => {
    const html = document.documentElement;
    const isCollapsed = html.getAttribute('data-sb-collapsed') === '1';
    const next = isCollapsed ? '0' : '1';
    html.setAttribute('data-sb-collapsed', next);
    try { localStorage.setItem('sb-collapsed', next); } catch {}
  };

  return (
    <button
      type="button"
      className="btn icon"
      aria-label="Compactar/expandir sidebar"
      title="Compactar/expandir sidebar"
      onClick={onToggle}
    >
      <span className="nav-emoji" aria-hidden>🗂️</span>
    </button>
  );
}
