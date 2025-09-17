// src/components/layout/RoleSidebar.tsx
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import type { AppRole } from '@/lib/roles';
import SidebarBase from '@/components/layout/SidebarBase';

type RoleSidebarProps = {
  role: AppRole;
  onNavigate?: () => void; // compatibilidade com chamadas a partir do DashboardFrame
};

export default function RoleSidebar({ role }: RoleSidebarProps) {
  const pathname = usePathname();

  // Itens comuns a todos os perfis
  const common = React.useMemo(
    () => [{ href: '/dashboard', label: 'Dashboard', activePrefix: '/dashboard' }],
    [],
  );

  // Itens por role — normalizamos para lidar com enum/union em MAIÚSCULAS
  const items = React.useMemo(() => {
    const r = String(role).toUpperCase();

    if (r === 'ADMIN') {
      return [
        ...common,
        { href: '/dashboard/admin', label: 'Administração', activePrefix: '/dashboard/admin' },
        { href: '/dashboard/sistema', label: 'Sistema', activePrefix: '/dashboard/sistema' },
      ];
    }

    if (r === 'TRAINER' || r === 'PT' || r === 'PERSONAL_TRAINER') {
      return [
        ...common,
        { href: '/dashboard/pt', label: 'PT', activePrefix: '/dashboard/pt' },
        { href: '/dashboard/pt/clientes', label: 'Clientes', activePrefix: '/dashboard/pt/clientes' },
      ];
    }

    if (r === 'CLIENT') {
      return [
        ...common,
        { href: '/dashboard/planos', label: 'Planos', activePrefix: '/dashboard/planos' },
        { href: '/dashboard/nutricao', label: 'Nutrição', activePrefix: '/dashboard/nutricao' },
      ];
    }

    return common;
  }, [role, common]);

  const activeIndex = React.useMemo(
    () => items.findIndex((it) => pathname?.startsWith(it.activePrefix ?? it.href)),
    [items, pathname],
  );

  const itemsTagged = React.useMemo(
    () => items.map((it, i) => ({ ...it, active: i === activeIndex })),
    [items, activeIndex],
  );

  // Não passamos onNavigate porque o SidebarBase não suporta essa prop
  return <SidebarBase items={itemsTagged} />;
}
