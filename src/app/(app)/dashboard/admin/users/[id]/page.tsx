export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import type { Route } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export default async function UserProfile({ params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const viewer = (session as any)?.user;
  if (!viewer?.id) redirect('/login' as Route);
  if (toAppRole(viewer.role) !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const { data: u } = await sb
    .from('users')
    .select('id,name,email,role,status,created_at')
    .eq('id', params.id)
    .single();

  if (!u) return notFound();

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <PageHeader
        title={`👤 ${u.name ?? u.email}`}
        subtitle={
          <>
            <Badge variant={u.role === 'ADMIN' ? 'info' : u.role === 'PT' ? 'primary' : 'neutral'}>{u.role}</Badge>{' '}
            <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'neutral'}>
              {u.status}
            </Badge>
          </>
        }
      />
      <Card>
        <CardContent>
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>ID:</strong> {u.id}</div>
            <div><strong>Email:</strong> {u.email}</div>
            <div><strong>Criado em:</strong> {u.created_at ? new Date(u.created_at).toLocaleString('pt-PT') : '—'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
