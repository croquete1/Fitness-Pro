export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export default async function AdminUsersPage() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const { data: users } = await sb
    .from('users')
    .select('id,name,email,role,status,created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <main className="p-4 space-y-4">
      <PageHeader title="Utilizadores" subtitle="Gestão de utilizadores" />
      <Card>
        <CardContent>
          {!users?.length ? (
            <div className="text-muted small">Sem utilizadores.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {users.map((u) => (
                <li key={u.id} style={{ marginBottom: 6 }}>
                  <Link href={`/dashboard/admin/users/${u.id}` as Route} className="btn chip">
                    {u.name ?? u.email}
                  </Link>{' '}
                  <Badge variant={u.role === 'ADMIN' ? 'info' : u.role === 'PT' ? 'primary' : 'neutral'}>
                    {u.role}
                  </Badge>{' '}
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'neutral'}>
                    {u.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
