// src/app/(app)/dashboard/layout.tsx
'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardFrame from '@/components/layout/DashboardFrame';
import type { AppRole } from '@/lib/roles';

export default function Layout({ children }: { children: React.ReactNode }) {
  // fallback defensivo caso o provider falhe
  const sessionValue =
    (useSession as unknown as () => {
      data: any;
      status: 'loading' | 'authenticated' | 'unauthenticated';
    })?.() ?? { data: null, status: 'unauthenticated' as const };

  const { data: session, status } = sessionValue;
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] grid place-items-center text-slate-500">
        A carregar…
      </div>
    );
  }

  if (!session) return null;

  const role = (session.user?.role ?? 'CLIENT') as AppRole;
  const userLabel = session.user?.name || session.user?.email || 'Utilizador';

  return (
    <DashboardFrame role={role} userLabel={userLabel}>
      {children}
    </DashboardFrame>
  );
}
