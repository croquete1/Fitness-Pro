'use client';

import { useSession } from 'next-auth/react';
import SidebarBase, { Group, Item } from '@/components/layout/SidebarBase';

const BASE_GERAL: Item[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <span className="nav-emoji">📊</span>, exact: true },
  { href: '/dashboard/reports', label: 'Relatórios', icon: <span className="nav-emoji">🧾</span> },
  { href: '/dashboard/settings', label: 'Definições', icon: <span className="nav-emoji">⚙️</span> },
];

export default function SidebarPT() {
  const { data } = useSession();
  const me = (data?.user as any) || {};

  const ALLOWED_ID = process.env.NEXT_PUBLIC_BILLING_PT_ID;
  const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_BILLING_PT_EMAIL;

  const canSeeBilling =
    (!!ALLOWED_ID && me?.id === ALLOWED_ID) ||
    (!!ALLOWED_EMAIL && me?.email === ALLOWED_EMAIL);

  const ptItems: Item[] = [
    { href: '/dashboard/pt/clients', label: 'Clientes', icon: <span className="nav-emoji">👫</span> },
    { href: '/dashboard/pt/plans', label: 'Planos', icon: <span className="nav-emoji">🧱</span> },
    { href: '/dashboard/pt/library', label: 'Biblioteca', icon: <span className="nav-emoji">📚</span> },
  ];

  if (canSeeBilling) {
    ptItems.push({ href: '/dashboard/billing', label: 'Faturação', icon: <span className="nav-emoji">💳</span> });
  }

  const NAV: Group[] = [
    { title: 'GERAL', items: BASE_GERAL },
    { title: 'PT', items: ptItems },
  ];

  return <SidebarBase nav={NAV} showToggle />;
}
