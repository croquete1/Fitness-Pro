// src/app/(app)/dashboard/admin/layout.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { roleToHomePath } from '@/types/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?next=' + encodeURIComponent('/dashboard/admin'));
  }

  const role = String((session.user as any)?.role ?? '').toUpperCase();

  // Só ADMIN pode aceder a esta área
  if (role !== 'ADMIN') {
    redirect(roleToHomePath(role));
  }

  return <>{children}</>;
}
