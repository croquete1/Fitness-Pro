// src/app/(app)/dashboard/admin/approvals/page.tsx
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Toolbar from '@/components/ui/Toolbar';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toAppRole } from '@/lib/roles';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { AppRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import type { Role as DbRole, Status as DbStatus } from '@prisma/client';

type Row = {
  id: string;
  name: string | null;
  email: string;
  role: DbRole;     // 'ADMIN' | 'TRAINER' | 'CLIENT' (DB)
  status: DbStatus; // 'PENDING' | 'ACTIVE' | 'SUSPENDED' (DB)
  createdAt: string;
};

function mapRoleBadge(role: DbRole) {
  // ADMIN -> info, TRAINER -> primary, CLIENT -> neutral
  if (role === 'ADMIN') return { variant: 'info' as const, label: 'ADMIN' };
  if (role === 'TRAINER') return { variant: 'primary' as const, label: 'PT' };
  return { variant: 'neutral' as const, label: 'CLIENT' };
}

export default async function ApprovalsPage() {
  // Guard de acesso: só ADMIN
  const session = await getServerSession(authOptions);
  const role = (toAppRole(session?.user?.role) ?? 'CLIENT') as AppRole;
  if (!session?.user?.id) redirect('/login');
  if (role !== 'ADMIN') redirect('/dashboard');

  const rowsRaw = await prisma.user.findMany({
    where: { status: 'PENDING' },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const rows: Row[] = rowsRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <PageHeader
        title="✅ Aprovações"
        subtitle="Revê e aprova novas contas pendentes."
      />

      <Toolbar
        left={
          <>
            <span style={{ fontSize: 14, opacity: 0.8 }}>
              Pendentes: <strong>{rows.length}</strong>
            </span>
          </>
        }
        right={
          <>
            {/* espaço para futuros filtros/ações */}
            <Link
              href="/dashboard/admin/users"
              style={{
                textDecoration: 'none',
                border: '1px solid rgba(0,0,0,0.15)',
                padding: '6px 10px',
                borderRadius: 8,
              }}
            >
              Ir a Utilizadores
            </Link>
          </>
        }
      />

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Não há registos pendentes.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: 8 }}>Nome</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Role</th>
                    <th style={{ padding: 8 }}>Estado</th>
                    <th style={{ padding: 8 }}>Criado</th>
                    <th style={{ padding: 8 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const rb = mapRoleBadge(r.role);
                    return (
                      <tr key={r.id} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                        <td style={{ padding: 8, fontWeight: 600 }}>{r.name ?? '—'}</td>
                        <td style={{ padding: 8 }}>{r.email}</td>
                        <td style={{ padding: 8 }}>
                          <Badge variant={rb.variant}>{rb.label}</Badge>
                        </td>
                        <td style={{ padding: 8 }}>
                          <Badge variant="warning">{r.status}</Badge>
                        </td>
                        <td style={{ padding: 8 }}>
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: 8 }}>
                          <Link
                            href={`/dashboard/admin/users/${r.id}`}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
