'use client';

import SidebarBase, { Ico } from './SidebarBase';
import Image from 'next/image';

export default function SidebarPT() {
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
            { label: 'Dashboard',  href: '/dashboard/pt',        icon: Ico.Dashboard },
            { label: 'Definições', href: '/dashboard/settings',  icon: Ico.Settings },
          ],
        },
        {
          title: 'Gestão',
          items: [
            { label: 'Clientes', href: '/dashboard/pt/clients',  icon: Ico.Users },
            { label: 'Agenda',   href: '/dashboard/pt/schedule', icon: Ico.Reports },
          ],
        },
        {
          title: 'Faturação',
          items: [
            // A página /dashboard/billing valida no servidor se o PT tem acesso
            { label: 'Faturação', href: '/dashboard/billing', icon: Ico.Billing },
          ],
        },
      ]}
    />
  );
}
