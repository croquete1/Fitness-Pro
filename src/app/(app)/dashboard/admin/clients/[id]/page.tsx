export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ClientSheet from '@/components/client/ClientSheet';
import TrainerLinks from '@/components/client/TrainerLinks';
import type { AppRole, DbRole } from '@/lib/roles';
import { dbRoleToAppRole, toAppRole } from '@/lib/roles';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type UiClient = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};
type UiTrainer = { id: string; name: string | null; email: string };

export default async function ClientProfile({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (toAppRole(session.user.role) !== 'ADMIN') redirect('/dashboard');

  const clientRaw = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  if (!clientRaw) return notFound();

  const user: UiClient = {
    id: clientRaw.id,
    name: clientRaw.name,
    email: clientRaw.email,
    role: (dbRoleToAppRole(clientRaw.role as DbRole) ?? 'CLIENT') as AppRole,
    status: clientRaw.status as UiClient['status'],
    createdAt: clientRaw.createdAt.toISOString(),
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
  const currentTrainerIds = links.map((l) => l.trainer_id);

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <PageHeader
        title={`🧑‍🤝‍🧑 ${user.name ?? user.email}`}
        subtitle={
          <>
            <Badge variant="neutral">CLIENT</Badge>{' '}
            <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'neutral'}>
              {user.status}
            </Badge>
          </>
        }
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
