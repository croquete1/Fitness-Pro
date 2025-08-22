// src/components/layout/SidebarAdmin.tsx
'use client';
import SidebarBase, { NavGroup } from './SidebarBase';
import {
  IconDashboard,
  IconReports,
  IconSettings,
  IconApprovals,
  IconUsers,
  IconHealth,
  IconBilling,
} from '@/components/icons/sidebar';

export default function SidebarAdmin() {
  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
        { href: '/dashboard/reports', label: 'Relatórios', icon: <IconReports /> },
        { href: '/dashboard/settings', label: 'Definições', icon: <IconSettings /> },
      ],
    },
    {
      title: 'Admin',
      items: [
        { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <IconApprovals /> },
        { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <IconUsers /> },
        { href: '/dashboard/admin/system-health', label: 'Saúde do sistema', icon: <IconHealth /> },
      ],
    },
    {
      title: 'Faturação',
      items: [{ href: '/dashboard/billing', label: 'Faturação', icon: <IconBilling /> }],
    },
  ];

  return (
    <SidebarBase
      brand={{ name: 'Fitness Pro', sub: 'Dashboard', href: '/dashboard', logoSrc: '/logo.svg' }}
      groups={groups}
    />
  );
}
