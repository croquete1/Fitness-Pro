// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = (session.user as any).role;
  if (role === 'ADMIN') redirect('/dashboard/admin');
  if (role === 'PT') redirect('/dashboard/pt');
  redirect('/dashboard/clients');
}
