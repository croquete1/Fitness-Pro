// src/components/layout/SidebarToggle.tsx
'use client';
import { useEffect, useState } from 'react';

export default function SidebarToggle(){
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const saved = localStorage.getItem('sb-collapsed') === '1';
    setCollapsed(saved);
    html.dataset.sbPinned = '1';                        // sidebar afixada por omissão
    html.dataset.sbCollapsed = saved ? '1' : '0';
  }, []);
  function toggle(){
    const html = document.documentElement;
    const next = !collapsed;
    setCollapsed(next);
    html.dataset.sbCollapsed = next ? '1' : '0';
    localStorage.setItem('sb-collapsed', next ? '1' : '0');
  }
  return (
    <button className="sb-toggle" onClick={toggle} aria-label={collapsed ? 'Expandir menu' : 'Compactar menu'}>
      <span className="chev" />
    </button>
  );
}
