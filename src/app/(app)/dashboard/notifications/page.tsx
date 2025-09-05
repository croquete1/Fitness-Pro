// src/app/(app)/dashboard/notifications/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Link from 'next/link';
import type { Route } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import NotificationsClient from './ui/NotificationsClient';

export default async function NotificationsPage({ searchParams }: { searchParams?: { status?: 'all'|'unread'|'read'; page?: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) redirect('/login');

  const status = (searchParams?.status ?? 'unread') as 'all'|'unread'|'read';
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  const sb = createServerClient();
  let q = sb
    .from('notifications')
    .select('id,title,body,href,created_at,read', { count: 'exact' })
    .eq('user_id', meId)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (status === 'unread') q = q.eq('read', false);
  if (status === 'read') q = q.eq('read', true);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Notificações</h1>

      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link className="btn chip" href={`/dashboard/notifications?status=unread` as Route} prefetch data-active={status==='unread'}>Por ler</Link>
          <Link className="btn chip" href={`/dashboard/notifications?status=read` as Route}   prefetch data-active={status==='read'}>Lidas</Link>
          <Link className="btn chip" href={`/dashboard/notifications?status=all` as Route}    prefetch data-active={status==='all'}>Todas</Link>
        </div>

        <NotificationsClient
          initialItems={(data ?? []).map(n => ({
            id: n.id,
            title: n.title,
            body: n.body,
            href: n.href,
            createdAt: n.created_at,
            read: n.read,
          }))}
          total={count ?? 0}
          page={page}
          pageSize={pageSize}
          status={status}
        />
      </div>
    </div>
  );
}
