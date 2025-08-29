import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, Status } from '@prisma/client';
import Badge from '@/components/ui/Badge';
import ApproveRejectButtons from '@/components/admin/ApproveRejectButtons';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.ADMIN) redirect('/dashboard');

  const rows = await prisma.user.findMany({
    where: { status: Status.PENDING },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div
        className="card-head"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h1 style={{ margin: 0 }}>Aprovações</h1>
        <div className="toolbar">
          <Badge variant="info">Pendentes: {rows.length}</Badge>
        </div>
      </div>

      {rows.length === 0 ? (
        <div
          className="muted"
          style={{
            padding: 24,
            display: 'grid',
            placeItems: 'center',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40 }}>🎉</div>
          <div>Sem pedidos pendentes.</div>
        </div>
      ) : (
        <table
          className="table"
          style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Utilizador</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Criado</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 8 }}>
                  <Link href={`/dashboard/users/${r.id}`} className="btn chip">
                    {r.name ?? '—'}
                  </Link>
                </td>
                <td style={{ padding: 8 }}>{r.email}</td>
                <td style={{ padding: 8 }}>
                  <Badge
                    variant={
                      r.role === Role.ADMIN
                        ? 'info'
                        : r.role === Role.TRAINER
                        ? 'primary'
                        : 'neutral'
                    }
                  >
                    {r.role}
                  </Badge>
                </td>
                <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>
                  <ApproveRejectButtons userId={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
