'use client';

import SidebarBase, { Group } from '@/components/layout/SidebarBase';

const NAV: Group[] = [
  {
    title: 'GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <span className="nav-emoji">📊</span>, exact: true },
      { href: '/dashboard/my-plan', label: 'O meu plano', icon: <span className="nav-emoji">🧩</span> },
      { href: '/dashboard/messages', label: 'Mensagens', icon: <span className="nav-emoji">💬</span> },
      { href: '/dashboard/settings', label: 'Definições', icon: <span className="nav-emoji">⚙️</span> },
      { href: '/dashboard/billing', label: 'Faturação', icon: <span className="nav-emoji">💳</span> }, // agora visível ao cliente
    ],
  },
];

export default function SidebarClient() {
  return <SidebarBase nav={NAV} showToggle />;
}
