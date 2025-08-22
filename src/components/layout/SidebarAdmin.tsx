// src/components/layout/SidebarAdmin.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import SidebarBase, { Ico } from './SidebarBase';

export default function SidebarAdmin() {
  return (
    <SidebarBase
      brand={
        <>
          <Image
            className="logo"
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            priority
          />
          <span className="brand-text">
            <span className="brand-name">Fitness Pro</span>
            <span className="brand-sub">Dashboard</span>
          </span>
        </>
      }
      groups={[
        {
          title: 'Geral',
          items: [
            { label: 'Dashboard',   href: '/dashboard',             icon: Ico.Dashboard },
            { label: 'Relatórios',  href: '/dashboard/reports',     icon: Ico.Reports },
            { label: 'Definições',  href: '/dashboard/settings',    icon: Ico.Settings },
          ],
        },
        {
          title: 'Admin',
          items: [
            { label: 'Aprovações',       href: '/dashboard/admin/approvals', icon: Ico.Star },
            { label: 'Utilizadores',     href: '/dashboard/admin/users',     icon: Ico.Users },
            { label: 'Saúde do sistema', href: '/dashboard/admin/health',    icon: Ico.Health },
          ],
        },
        {
          title: 'Faturação',
          items: [{ label: 'Faturação', href: '/dashboard/billing', icon: Ico.Billing }],
        },
      ]}
    />
  );
}
