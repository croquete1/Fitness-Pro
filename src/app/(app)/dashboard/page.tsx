export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

export default async function DashboardRoot() {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role) ?? 'CLIENT';

  if (role === 'ADMIN') redirect('/dashboard/admin' as any);
  if (role === 'PT') redirect('/dashboard/pt' as any);
  // cliente → manda para uma vista útil (ajusta se preferires outra)
  redirect('/dashboard/my-plan' as any);
}
