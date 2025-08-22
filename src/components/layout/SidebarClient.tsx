'use client';

import SidebarBase, { Ico } from './SidebarBase';
import Image from 'next/image';

export default function SidebarClient() {
  return (
    <SidebarBase
      brand={
        <>
          <img className="logo" src="/logo.png" alt="" width={28} height={28} />
        </>
      }
      groups={[
        {
          title: 'Geral',
          items: [
            { label: 'Dashboard',  href: '/dashboard',            icon: Ico.Dashboard },
            { label: 'Relatórios', href: '/dashboard/reports',    icon: Ico.Reports },
            { label: 'Definições', href: '/dashboard/settings',   icon: Ico.Settings },
          ],
        },
        {
          title: 'Treino',
          items: [
            { label: 'Planos',     href: '/dashboard/training/plans', icon: Ico.Reports },
            { label: 'Sessões',    href: '/dashboard/sessions',       icon: Ico.Health  },
          ],
        },
        {
          title: 'Faturação',
          items: [
            { label: 'Faturação', href: '/dashboard/billing', icon: Ico.Billing },
          ],
        },
      ]}
    />
  );
}
