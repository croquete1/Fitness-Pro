// src/app/(app)/dashboard/admin/clients/page.tsx
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

type Row = {
  id: string;
  name: string | null;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};

export default async function AdminClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (toAppRole(session.user.role) !== 'ADMIN') redirect('/dashboard');

  const rowsRaw = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const rows: Row[] = rowsRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status as Row['status'],
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <PageHeader title="🧑‍🤝‍🧑 Clientes" subtitle="Lista de clientes registados." />
      <Toolbar right={<div style={{ opacity: 0.8, fontSize: 14 }}>Total: {rows.length}</div>} />
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Sem clientes.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: 8 }}>Nome</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Estado</th>
                    <th style={{ padding: 8 }}>Criado</th>
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
                      <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>
                        <Link
                          href={`/dashboard/admin/clients/${r.id}`}
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
