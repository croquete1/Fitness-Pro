'use client';

import SidebarBase, { type Group } from '@/components/layout/SidebarBase';

const NAV: Group[] = [
  {
    title: 'CLIENTE',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <span>🏠</span>, exact: true },
      { href: '/dashboard/pt/plans', label: 'Os meus planos', icon: <span>📝</span> },
      { href: '/dashboard/billing', label: 'Pagamentos', icon: <span>💳</span> },
    ],
  },
];

export default function SidebarClient() {
  return <SidebarBase nav={NAV} showToggle />;
}
