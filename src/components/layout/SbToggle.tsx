'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

export default function SbToggle() {
  const [collapsed, setCollapsed] = useState(false);

  // aplicar estado guardado e sincronizar no arranque
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('sb-collapsed')) || '0';
    const isCollapsed = saved === '1';
    document.documentElement.setAttribute('data-sb-collapsed', isCollapsed ? '1' : '0');
    setCollapsed(isCollapsed);
  }, []);

  const onToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.setAttribute('data-sb-collapsed', next ? '1' : '0');
    try { localStorage.setItem('sb-collapsed', next ? '1' : '0'); } catch {}
  };

  return (
    <button
      type="button"
      className="btn icon"
      aria-pressed={collapsed}
      aria-label="Compactar/expandir sidebar"
      title={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
      onClick={onToggle}
    >
      {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
    </button>
  );
}
