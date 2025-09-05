export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';

export default async function PTPlanDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const role = (toAppRole(session.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const viewerId = String(session.user.id);

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      trainerId: true,
      clientId: true,
      title: true,
      status: true,
      notes: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  if (!plan) return notFound();

  // PT só pode ver se for o dono do plano
  if (role === 'PT' && plan.trainerId !== viewerId) redirect('/dashboard/pt/training-plans');

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <PageHeader
        title={`📝 ${plan.title}`}
        subtitle={
          <>
            <Badge variant={plan.status === 'ACTIVE' ? 'success' : plan.status === 'DRAFT' ? 'info' : 'neutral'}>
              {String(plan.status)}
            </Badge>{' '}
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              • Atualizado {new Date(plan.updatedAt).toLocaleString()}
            </span>
          </>
        }
      />
      <Card>
        <CardContent>
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <strong>Trainer:</strong> {plan.trainerId}
            </div>
            <div>
              <strong>Cliente:</strong> {plan.clientId}
            </div>
            <div>
              <strong>Criado:</strong> {new Date(plan.createdAt).toLocaleString()}
            </div>
            {plan.notes && (
              <div>
                <strong>Notas:</strong> {plan.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
