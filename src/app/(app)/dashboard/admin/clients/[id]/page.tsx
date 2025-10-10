export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import type { Route } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionUserSafe();
  const viewer = (session as any)?.user;
  if (!viewer?.id) redirect('/login' as Route);
  if (toAppRole(viewer.role) !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const { data: c } = await sb
    .from('users')
    .select('id,name,email,role,status,created_at')
    .eq('id', id)
    .single();

  if (!c) return notFound();

  return (
    <div style={{ display: 'grid', gap: 12, padding: 12 }}>
      <PageHeader
        title={`🧑‍🤝‍🧑 ${c.name ?? c.email}`}
        subtitle={
          <>
            <Badge variant="neutral">CLIENT</Badge>{' '}
            <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'PENDING' ? 'warning' : 'neutral'}>
              {c.status}
            </Badge>
          </>
        }
      />
      <Card>
        <CardContent>
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>ID:</strong> {c.id}</div>
            <div><strong>Email:</strong> {c.email}</div>
            <div><strong>Criado em:</strong> {c.created_at ? new Date(c.created_at).toLocaleString('pt-PT') : '—'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
