'use client';

import SidebarBase, { type Group } from '@/components/layout/SidebarBase';

const NAV: Group[] = [
  {
    title: 'GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <span>📊</span>, exact: true },
      { href: '/dashboard/reports', label: 'Relatórios', icon: <span>🧾</span> },
      { href: '/dashboard/settings', label: 'Definições', icon: <span>⚙️</span> },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <span>✅</span> },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <span>👥</span> },
      { href: '/dashboard/billing', label: 'Faturação', icon: <span>💳</span> },
    ],
  },
];

export default function SidebarAdmin() {
  return <SidebarBase nav={NAV} showToggle />;
}
