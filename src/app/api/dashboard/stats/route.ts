import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Res = {
  counts: { clients?: number; trainers?: number; admins?: number; sessions7d?: number };
  notifications: { unread: number };
  upcoming?: { when: string; title?: string }[];
};

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  const appRole = toAppRole((session as any)?.user?.role) ?? 'CLIENT';

  const sb = createServerClient();

  async function safeCount(table: string, build: (q: any) => any) {
    try {
      let q = sb.from(table).select('*', { count: 'exact', head: true });
      q = build(q);
      const { count } = await q;
      return count ?? 0;
    } catch {
      return 0;
    }
  }
  async function safeSelect<T>(table: string, build: (q: any) => any): Promise<T[]> {
    try {
      let q = sb.from(table).select('*');
      q = build(q);
      const { data } = await q;
      return (data ?? []) as T[];
    } catch {
      return [];
    }
  }

  const now = new Date();
  const to = new Date(now); to.setDate(now.getDate() + 7);

  let payload: Res = { counts: {}, notifications: { unread: 0 }, upcoming: [] };

  if (appRole === 'ADMIN') {
    payload.counts.clients  = await safeCount('users', (q) => q.eq('role', 'CLIENT'));
    payload.counts.trainers = await safeCount('users', (q) => q.eq('role', 'TRAINER'));
    payload.counts.admins   = await safeCount('users', (q) => q.eq('role', 'ADMIN'));
    payload.counts.sessions7d = await safeCount('sessions', (q) =>
      q.gte('start_time', now.toISOString()).lt('start_time', to.toISOString())
    );
    payload.upcoming = await safeSelect<{ start_time: string; title?: string }>('sessions', (q) =>
      q.gte('start_time', now.toISOString())
       .lt('start_time', to.toISOString())
       .order('start_time', { ascending: true })
       .select('start_time,title')
    ).then(arr => arr.map(r => ({ when: r.start_time, title: r.title })));
  }
  else if (appRole === 'PT' && userId) {
    // clientes do PT (via client_packages)
    const cps = await safeSelect<{ client_id: string }>('client_packages', (q) => q.eq('trainer_id', userId).select('client_id'));
    payload.counts.clients = new Set(cps.map(x => x.client_id)).size;
    payload.counts.sessions7d = await safeCount('sessions', (q) =>
      q.eq('trainer_id', userId)
       .gte('start_time', now.toISOString())
       .lt('start_time', to.toISOString())
    );
    payload.upcoming = await safeSelect<{ start_time: string; title?: string }>('sessions', (q) =>
      q.eq('trainer_id', userId)
       .gte('start_time', now.toISOString())
       .lt('start_time', to.toISOString())
       .order('start_time', { ascending: true })
       .select('start_time,title')
    ).then(arr => arr.map(r => ({ when: r.start_time, title: r.title })));
  }
  else if (userId) {
    // CLIENT
    payload.counts.sessions7d = await safeCount('sessions', (q) =>
      q.eq('client_id', userId)
       .gte('start_time', now.toISOString())
       .lt('start_time', to.toISOString())
    );
    payload.upcoming = await safeSelect<{ start_time: string; title?: string }>('sessions', (q) =>
      q.eq('client_id', userId)
       .gte('start_time', now.toISOString())
       .lt('start_time', to.toISOString())
       .order('start_time', { ascending: true })
       .select('start_time,title')
    ).then(arr => arr.map(r => ({ when: r.start_time, title: r.title })));
  }

  // notificações por utilizador
  if (userId) {
    payload.notifications.unread = await safeCount('notifications', (q) =>
      q.eq('user_id', userId).eq('read', false)
    );
  }

  return NextResponse.json(payload);
}
