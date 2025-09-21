// src/app/(app)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions, dashboardForRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  redirect(dashboardForRole(role));
}
