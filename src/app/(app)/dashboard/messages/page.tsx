// src/app/(app)/dashboard/messages/page.tsx
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

function formatDatePT(iso: string | null) {
  if (!iso) return '—';
  try {
    // Usa fuso do runtime (no Vercel, UTC) mas formato PT-PT.
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

export default async function MessagesPage() {
  const sessionUser = await getSessionUserSafe();
  const userId = sessionUser?.user?.id;
  if (!userId) redirect('/login');

  const sb = createServerClient();

  // Buscar últimas 50 notificações do utilizador, com tipagem explícita.
  const { data, error } = await sb
    .from('notifications')
    .select('id,title,body,link,created_at,read')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<Row[]>();

  // Em caso de erro, mostramos lista vazia mas sem quebrar a página.
  const items: Row[] = Array.isArray(data) ? data : [];

  return (
    <div className="p-4 grid gap-3">
      <div
        className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm"
        role="region"
        aria-labelledby="messages-heading"
      >
        <div id="messages-heading" className="p-3 border-b text-sm font-semibold">
          Mensagens
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700/90 dark:text-red-300" role="alert">
            Ocorreu um erro a carregar as mensagens. A tentar novamente mais tarde.
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-3 text-sm opacity-70">Sem mensagens.</div>
        ) : (
          <ul className="p-3 space-y-2">
            {items.map((n) => {
              const unread = n.read === false || n.read == null; // tratar null como não lida
              const createdAt = formatDatePT(n.created_at);
              const title = n.title?.trim() || 'Notificação';

              const hasLink = !!n.link && n.link.trim().length > 0;
              const href = n.link?.trim() || '#';
              const external = hasLink && isExternalLink(href);

              return (
                <li
                  key={n.id}
                  className="rounded-lg border p-2 bg-white dark:bg-slate-800"
                  style={{ background: unread ? 'var(--hover, rgba(0,0,0,0.04))' : undefined }}
                  aria-live="polite"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium flex items-center gap-2">
                      <span>{title}</span>
                      {unread && (
                        <span
                          className="text-xs rounded-full px-2 py-[2px] border"
                          aria-label="Por ler"
                          title="Por ler"
                          style={{ opacity: 0.85 }}
                        >
                          por ler
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-70">{createdAt}</div>
                  </div>

                  {n.body && (
                    <div className="text-sm opacity-90 mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                      {n.body}
                    </div>
                  )}

                  {hasLink && (
                    <div className="mt-2">
                      <a
                        className="btn chip"
                        href={href}
                        {...(external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        Abrir
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
