// src/app/(app)/dashboard/pt/training-plans/page.tsx
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

type Row = {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | string;
  updatedAt: string;
  createdAt: string;
};

export default async function PTTrainingPlansPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const role = (toAppRole(session.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const viewerId = String(session.user.id);
  const where = role === 'ADMIN' ? {} : { trainerId: viewerId };

  const rowsRaw = await prisma.trainingPlan.findMany({
    where,
    select: {
      id: true,
      trainerId: true,
      clientId: true,
      title: true,
      status: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });

  const rows: Row[] = rowsRaw.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <PageHeader title="📝 Planos de treino" subtitle="Planos sob sua gestão." />
      <Toolbar right={<div style={{ opacity: 0.8, fontSize: 14 }}>Total: {rows.length}</div>} />
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Sem planos.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: 8 }}>Título</th>
                    <th style={{ padding: 8 }}>Estado</th>
                    <th style={{ padding: 8 }}>Atualizado</th>
                    <th style={{ padding: 8 }}>Criado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{r.title}</td>
                      <td style={{ padding: 8 }}>
                        <Badge
                          variant={
                            r.status === 'ACTIVE'
                              ? 'success'
                              : r.status === 'DRAFT'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td style={{ padding: 8 }}>{new Date(r.updatedAt).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
