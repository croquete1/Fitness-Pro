'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Hotkeys() {
  const router = useRouter();
  const lastG = useRef<number>(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore quando a pessoa está a escrever num input/textarea/contenteditable
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

      // / ou Cmd/Ctrl+K -> focar pesquisa
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        const box = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (box) { e.preventDefault(); box.focus(); box.select(); }
        return;
      }

      // navegação em duas teclas: g + (p|u|a|d)
      const now = Date.now();
      if (e.key.toLowerCase() === 'g') { lastG.current = now; return; }
      if (now - lastG.current < 800) {
        const k = e.key.toLowerCase();
        if (k === 'p') router.push('/dashboard/pt/plans');
        if (k === 'u') router.push('/dashboard/users');
        if (k === 'a') router.push('/dashboard/admin/approvals');
        if (k === 'd') router.push('/dashboard');
        lastG.current = 0;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return null;
}
