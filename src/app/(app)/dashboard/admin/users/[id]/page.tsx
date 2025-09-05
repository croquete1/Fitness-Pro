export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ClientSheet from '@/components/client/ClientSheet';
import TrainerLinks from '@/components/client/TrainerLinks';
import ApproveSuspendActions from '@/components/admin/ApproveSuspendActions';
import { dbRoleToAppRole, toAppRole } from '@/lib/roles';
import type { AppRole, DbRole } from '@/lib/roles';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type UiUser = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};
type UiTrainer = { id: string; name: string | null; email: string };

export default async function UserProfile({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (toAppRole(session.user.role) !== 'ADMIN') redirect('/dashboard');

  const userRaw = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  if (!userRaw) return notFound();

  const user: UiUser = {
    id: userRaw.id,
    name: userRaw.name,
    email: userRaw.email,
    role: (dbRoleToAppRole(userRaw.role as DbRole) ?? 'CLIENT') as AppRole,
    status: userRaw.status as UiUser['status'],
    createdAt: userRaw.createdAt.toISOString(),
  };

  const trainers: UiTrainer[] = await prisma.user.findMany({
    where: { role: 'TRAINER', status: 'ACTIVE' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  const links = await prisma.$queryRawUnsafe<{ trainer_id: string }[]>(
    'select trainer_id from trainer_clients where client_id = $1',
    user.id
  );
  const currentTrainerIds = [...new Set(links.map((l) => l.trainer_id))];

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <PageHeader
        title={`👤 ${user.name ?? user.email}`}
        subtitle={
          <>
            <Badge variant={user.role === 'ADMIN' ? 'info' : user.role === 'PT' ? 'primary' : 'neutral'}>
              {user.role}
            </Badge>{' '}
            <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'neutral'}>
              {user.status}
            </Badge>
          </>
        }
        actions={<ApproveSuspendActions userId={user.id} status={user.status} />}
      />

      <Card>
        <CardContent>
          <ClientSheet user={user} trainers={trainers} currentTrainerIds={currentTrainerIds} />
          <div style={{ height: 12 }} />
          <h3 style={{ margin: 0 }}>Vínculos PT</h3>
          <div style={{ height: 8 }} />
          <TrainerLinks clientId={user.id} trainers={trainers} currentTrainerIds={currentTrainerIds} />
        </CardContent>
      </Card>
    </div>
  );
}
