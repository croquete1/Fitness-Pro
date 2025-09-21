// src/app/(app)/dashboard/pt/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions, dashboardForRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PtLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?redirect=${encodeURIComponent('/dashboard/pt')}`);

  const role = (session.user as any)?.role;
  if (role !== 'PT' && role !== 'TRAINER') {
    redirect(dashboardForRole(role));
  }
  return <>{children}</>;
}
