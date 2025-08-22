// src/app/(app)/dashboard/admin/approvals/page.tsx
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ApprovalsClient from '@/components/admin/ApprovalsClient';

function isAdmin(role: unknown) {
  const v = String(role ?? '').toUpperCase();
  return v === 'ADMIN';
}

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin((session.user as any)?.role)) {
    // opcional: podes redirect('/dashboard') se preferires
    return <div className="card" style={{ padding: 16 }}>Acesso negado.</div>;
  }

  const users = await prisma.user.findMany({
    where: { status: Status.PENDING },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const initial = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <ApprovalsClient initial={initial} />;
}
