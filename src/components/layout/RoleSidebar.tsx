// src/components/layout/RoleSidebar.tsx
'use client';

import * as React from 'react';
import SidebarAdmin from './SidebarAdmin';
import SidebarPT from './SidebarPT';
import SidebarClient from './SidebarClient';

type Props = {
  role?: string;
  userLabel?: string;
};

/**
 * Seleciona a sidebar pelo role.
 * Mantém MUI + emojis nos headers das sidebars específicas.
 */
export default function RoleSidebar({ role = 'CLIENT', userLabel }: Props) {
  const r = String(role || 'CLIENT').toUpperCase();

  if (r === 'ADMIN') return <SidebarAdmin userLabel={userLabel} />;
  if (r === 'TRAINER' || r === 'PT') return <SidebarPT userLabel={userLabel} />;

  return <SidebarClient userLabel={userLabel} />;
}
