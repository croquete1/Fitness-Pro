// src/components/layout/RoleSidebar.tsx
'use client';

import * as React from 'react';
import type { AppRole } from '@/lib/roles';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';

export default function RoleSidebar({
  role,
  userLabel,
}: {
  role: AppRole;
  userLabel: string;
}) {
  const r = String(role).toUpperCase();

  if (r === 'ADMIN') {
    return <SidebarAdmin userLabel={userLabel} />;
  }

  if (r === 'TRAINER' || r === 'PT' || r === 'PERSONAL_TRAINER') {
    return <SidebarPT userLabel={userLabel} />;
  }

  // CLIENTE
  return <SidebarClient userLabel={userLabel} />;
}
