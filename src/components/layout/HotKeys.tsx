'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Hotkeys() {
  const router = useRouter();

  useEffect(() => {
    const isTypingInField = (el: any) => {
      if (!el) return false;
      const tag = (el.tagName || '').toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    };

    let seq: string[] = [];

    const focusSearch = () => {
      const input =
        (document.getElementById('global-search') as HTMLInputElement) ||
        (document.querySelector('header input[type="search"]') as HTMLInputElement) ||
        (document.querySelector('.app-header .search-input') as HTMLInputElement);
      if (input) {
        input.focus();
        input.select?.();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (isTypingInField(tgt)) return;

      const k = e.key.toLowerCase();

      // "/" foca logo a pesquisa
      if (k === '/') {
        e.preventDefault();
        focusSearch();
        return;
      }

      // "?" abre ajuda (vai para dashboard com query para tal, sem depender de UI extra)
      if (k === '?' || (k === '/' && e.shiftKey)) {
        e.preventDefault();
        router.push('/dashboard?help=shortcuts');
        return;
      }

      // Sequências "g s", "g a", "g p", "g d"
      if (k === 'g') {
        seq = ['g'];
        return;
      }
      if (seq[0] === 'g') {
        seq.push(k);
        const second = seq[1];
        seq = [];
        if (second === 's') { e.preventDefault(); focusSearch(); return; }
        if (second === 'a') { e.preventDefault(); router.push('/dashboard/admin/approvals'); return; }
        if (second === 'p') { e.preventDefault(); router.push('/dashboard/pt/plans'); return; }
        if (second === 'd') { e.preventDefault(); router.push('/dashboard'); return; }
      }

      if (k === 'escape') (document.activeElement as HTMLElement)?.blur?.();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);

  return null;
}
