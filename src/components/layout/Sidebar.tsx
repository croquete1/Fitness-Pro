'use client';

import * as React from 'react';
import RoleSidebar from './RoleSidebar';
import SidebarToggle from './SidebarToggle';
import { useSidebar } from './SidebarProvider';

type Props = { role: 'ADMIN' | 'TRAINER' | 'CLIENT' | string };

export default function Sidebar({ role }: Props) {
  const { collapsed } = useSidebar();
  return (
    <aside className="fp-sidebar" data-collapsed={collapsed ? '1' : '0'}>
      <RoleSidebar role={role as any} />
      {/* Botão flutuante que usa useSidebar().toggle */}
      <SidebarToggle />
    </aside>
  );
}
