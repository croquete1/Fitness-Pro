export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ClientSheet from '@/components/client/ClientSheet';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';
import type { TrainingPlanSummary, SessionSummary } from '@/types/user';

export default async function PTClientDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const role = (toAppRole(session.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const viewerId = String(session.user.id);
  const clientId = params.id;

  // Cliente
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  if (!client) return notFound();

  // (Opcional) Se for PT, garantir que o cliente está associado
  if (role === 'PT') {
    const link = await prisma.trainerClient.findFirst({
      where: { trainerId: viewerId, clientId },
      select: { id: true },
    });
    if (!link) redirect('/dashboard/pt/clients');
  }

  // Planos (do PT ou todos se admin)
  const plansRaw = await prisma.trainingPlan.findMany({
    where: role === 'ADMIN' ? { clientId } : { clientId, trainerId: viewerId },
    select: { id: true, title: true, status: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
  const plans: TrainingPlanSummary[] = plansRaw.map((p) => ({
    id: p.id,
    title: p.title,
    status: (p.status as any) ?? undefined,
    updatedAt: p.updatedAt?.toISOString(),
  }));

  // Sessões entre PT e cliente (ou todas se admin)
  const sessionsRaw = await prisma.session.findMany({
    where:
      role === 'ADMIN'
        ? { clientId }
        : { clientId, trainerId: viewerId },
    select: { id: true, scheduledAt: true, notes: true },
    orderBy: { scheduledAt: 'desc' },
    take: 50,
  });
  const sessions: SessionSummary[] = sessionsRaw.map((s) => ({
    id: s.id,
    startsAt: s.scheduledAt.toISOString(),
    durationMin: 60,
    title: s.notes ?? 'Sessão',
    location: null,
  }));

  const user = {
    id: client.id,
    name: client.name,
    email: client.email,
    role: 'CLIENT' as const,
    status: client.status as 'PENDING' | 'ACTIVE' | 'SUSPENDED',
    createdAt: client.createdAt.toISOString(),
  };

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
          <ClientSheet
            role="PT"
            user={user}
            anthropometry={[]}         // (sem tabela no schema atual)
            currentPackage={null}      // (sem tabela no schema atual)
            packageHistory={[]}        // (sem tabela no schema atual)
            plans={plans}
            notes={[]}                 // (sem tabela no schema atual)
            sessions={sessions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
