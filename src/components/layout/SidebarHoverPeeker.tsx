// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import * as React from 'react';
import { useSidebar } from './SidebarProvider';

export default function SidebarHoverPeeker() {
  const { setPeek } = useSidebar();
  return (
    <div
      className="hidden lg:block fixed inset-y-0 left-0 z-30 w-2"
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
      aria-hidden
    />
  );
}
