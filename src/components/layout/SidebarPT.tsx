'use client';

import SidebarBase, { type Group } from '@/components/layout/SidebarBase';

const NAV: Group[] = [
  {
    title: 'PT',
    items: [
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: <span>👫</span> },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: <span>🧱</span> },
      { href: '/dashboard/pt/library', label: 'Biblioteca', icon: <span>📚</span> },
      { href: '/dashboard/billing', label: 'Faturação', icon: <span>💳</span> },
    ],
  },
];

export default function SidebarPT() {
  return <SidebarBase nav={NAV} showToggle />;
}
