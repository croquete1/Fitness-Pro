'use client';

import React from 'react';
import type { AppRole } from '@/lib/roles';
import SidebarAdmin from './SidebarAdmin';
import SidebarPT from './SidebarPT';
import SidebarClient from './SidebarClient';

export default function RoleSidebar({
  role,
  userLabel,
}: {
  role: AppRole;
  userLabel: string;
}) {
  if (role === 'ADMIN') return <SidebarAdmin userLabel={userLabel} />;
  if (role === 'PT') return <SidebarPT userLabel={userLabel} />;
  return <SidebarClient userLabel={userLabel} />;
}
