'use client';

import * as React from 'react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';

/**
 * Wrapper fininho que escolhe a sidebar certa por role.
 * Cada Sidebar* usa o SidebarBase, que trata de desktop/mobile e animações.
 */
export default function RoleSidebar({ role, userLabel }: { role: string; userLabel?: string }) {
  const r = String(role || 'CLIENT').toUpperCase();

  if (r === 'ADMIN') return <SidebarAdmin userLabel={userLabel} />;
  if (r === 'TRAINER' || r === 'PT') return <SidebarPT userLabel={userLabel} />;
  return <SidebarClient userLabel={userLabel} />;
}
