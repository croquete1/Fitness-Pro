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

export default async function AdminClientsPage() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);
  if (toAppRole(user.role) !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const { data: clients } = await sb
    .from('users')
    .select('id,name,email,status,created_at')
    .eq('role', 'CLIENT')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <main className="p-4 space-y-4">
      <PageHeader title="Clientes" subtitle="Gestão de clientes" />
      <Card>
        <CardContent>
          {!clients?.length ? (
            <div className="text-muted small">Sem clientes.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {clients.map((c) => (
                <li key={c.id} style={{ marginBottom: 6 }}>
                  <Link href={`/dashboard/admin/clients/${c.id}` as Route} className="btn chip">
                    {c.name ?? c.email}
                  </Link>{' '}
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'PENDING' ? 'warning' : 'neutral'}>
                    {c.status}
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
