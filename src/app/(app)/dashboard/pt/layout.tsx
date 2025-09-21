// src/app/(app)/dashboard/pt/layout.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { roleToHomePath } from '@/types/auth';

export default async function PtLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?next=' + encodeURIComponent('/dashboard/pt'));
  }

  const role = String((session.user as any)?.role ?? '').toUpperCase();

  // Bloqueia acesso a não-PT (TRAINER é equivalente a PT)
  if (role !== 'PT' && role !== 'TRAINER') {
    redirect(roleToHomePath(role));
  }

  return <>{children}</>;
}
