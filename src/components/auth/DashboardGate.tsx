// src/components/auth/DashboardGate.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function roleHome(role?: string | null) {
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN') return '/dashboard/admin';
  if (r === 'PT' || r === 'TRAINER') return '/dashboard/pt';
  return '/dashboard';
}

export default function DashboardGate() {
  const { status, data } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (status !== 'authenticated') return;
    if (pathname !== '/dashboard' && pathname !== '/dashboard/') return;

    done.current = true; // evita loops
    const target = roleHome((data?.user as any)?.role);
    if (target && target !== pathname) router.replace(target);
  }, [status, data?.user, pathname, router]);

  return null;
}
