// src/app/(app)/dashboard/admin/users/page.tsx
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import UsersClientView from './UsersClientView';
import type { AppRole, DbRole } from '@/lib/roles';
import { dbRoleToAppRole, toAppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

type UiUser = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};

async function getUsers(): Promise<UiUser[]> {
  const rows = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: (dbRoleToAppRole(u.role as DbRole) ?? 'CLIENT') as AppRole,
    status: u.status as UiUser['status'],
    createdAt: u.createdAt.toISOString(),
  }));
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const role = toAppRole(session?.user?.role);
  if (!session?.user?.id) redirect('/login');
  if (role !== 'ADMIN') redirect('/dashboard');

  const users = await getUsers();

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <PageHeader title="👥 Utilizadores" subtitle="Gestão de contas da plataforma." />
      <Toolbar right={<div style={{ opacity: 0.8, fontSize: 14 }}>Total: {users.length}</div>} />
      <Card>
        <CardContent>
          <Suspense fallback={<div style={{ padding: 12 }}>A carregar utilizadores…</div>}>
            <UsersClientView users={users} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
