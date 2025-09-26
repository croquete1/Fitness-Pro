// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

function roleToHomePath(role?: string | null) {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'TRAINER':
      return '/dashboard/pt';
    case 'CLIENT':
    default:
      return '/dashboard/clients';
  }
}

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = (session.user as any)?.role ?? null;
  redirect(roleToHomePath(role));
}
