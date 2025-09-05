// src/app/(app)/dashboard/pt/clients/page.tsx
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

type Row = {
  id: string;
  name: string | null;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
};

export default async function PTClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const role = (toAppRole(session.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const trainerId = String(session.user.id);

  const links = await prisma.trainerClient.findMany({
    where: { trainerId },
    select: {
      client: { select: { id: true, name: true, email: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const rows: Row[] = links.map((l) => ({
    id: l.client.id,
    name: l.client.name,
    email: l.client.email,
    status: l.client.status as Row['status'],
  }));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <PageHeader title="🧑‍🤝‍🧑 Meus clientes" subtitle="Clientes associados ao seu perfil." />
      <Toolbar right={<div style={{ opacity: 0.8, fontSize: 14 }}>Total: {rows.length}</div>} />
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Ainda sem clientes associados.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: 8 }}>Nome</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Estado</th>
                    <th style={{ padding: 8 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{r.name ?? '—'}</td>
                      <td style={{ padding: 8 }}>{r.email}</td>
                      <td style={{ padding: 8 }}>
                        <Badge
                          variant={
                            r.status === 'ACTIVE'
                              ? 'success'
                              : r.status === 'PENDING'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td style={{ padding: 8 }}>
                        <Link
                          href={`/dashboard/pt/clients/${r.id}`}
                          style={{
                            textDecoration: 'none',
                            border: '1px solid rgba(0,0,0,0.15)',
                            padding: '6px 10px',
                            borderRadius: 8,
                          }}
                        >
                          Abrir
                        </Link>
                      </td>
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
