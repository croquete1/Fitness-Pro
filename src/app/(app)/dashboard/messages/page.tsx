export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type Row = {
  id: string;
  title: string | null;
  body: string | null;
  link: string | null;
  created_at: string | null;
  read: boolean | null;
};

export default async function MessagesPage() {
  const user = await getSessionUserSafe();
  if (!user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb
    .from('notifications')
    .select('id,title,body,link,created_at,read')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const items = (data ?? []) as Row[];

  return (
    <div className="p-4 grid gap-3">
      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm">
        <div className="p-3 border-b text-sm font-semibold">Mensagens</div>
        {items.length === 0 ? (
          <div className="p-3 text-sm opacity-70">Sem mensagens.</div>
        ) : (
          <ul className="p-3 space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border p-2 bg-white dark:bg-slate-800"
                style={{ background: n.read ? undefined : 'var(--hover)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{n.title ?? 'Notificação'}</div>
                  <div className="text-xs opacity-70">
                    {n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : '—'}
                  </div>
                </div>
                {!!n.body && <div className="text-sm opacity-90 mt-1">{n.body}</div>}
                {!!n.link && (
                  <div className="mt-2">
                    <a className="btn chip" href={n.link}>
                      Abrir
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
