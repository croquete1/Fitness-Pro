// src/app/(app)/dashboard/admin/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions, dashboardForRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?redirect=${encodeURIComponent('/dashboard/admin')}`);

  const role = (session.user as any)?.role;
  if (role !== 'ADMIN') {
    // ✅ já autenticado, manda-o para a sua área (PT/cliente)
    redirect(dashboardForRole(role));
  }
  return <>{children}</>;
}
