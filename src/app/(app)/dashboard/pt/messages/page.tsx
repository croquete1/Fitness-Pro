export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import MessagesFeed from '@/app/(app)/dashboard/messages/_components/MessagesFeed';
import type { MessageListRow } from '@/lib/messages/types';

export default async function PTMessagesPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('messages')
    .select('id,body,sent_at,from_id,to_id')
    .or(`from_id.eq.${session.user.id},to_id.eq.${session.user.id}`)
    .order('sent_at', { ascending: false })
    .limit(120);

  const messages: MessageListRow[] = (data ?? []).map((row: any) => {
    const sentAt = typeof row.sent_at === 'string' ? row.sent_at : null;
    const fromId = row.from_id ?? null;
    const toId = row.to_id ?? null;
    const direction = fromId === session.user.id ? 'outbound' : toId === session.user.id ? 'inbound' : 'internal';
    return {
      id: String(row.id ?? crypto.randomUUID()),
      body: row.body ?? null,
      sentAt,
      relative: null,
      fromId,
      toId,
      fromName: null,
      toName: null,
      direction,
      channel: 'in-app',
      channelLabel: 'App',
      responseMinutes: null,
    } satisfies MessageListRow;
  });

  return (
    <div className="neo-stack neo-stack--xl">
      <header className="page-header neo-panel neo-panel--header">
        <div className="page-header__body">
          <h1 className="page-header__title heading-solid">Mensagens</h1>
          <p className="page-header__subtitle">
            Comunicação rápida com clientes e equipa de suporte.
          </p>
        </div>
      </header>

      <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="pt-messages-heading">
        <div className="neo-inline neo-inline--between neo-inline--wrap neo-inline--sm">
          <div>
            <h2 id="pt-messages-heading" className="neo-panel__title">
              Histórico de mensagens
            </h2>
            <p className="neo-panel__subtitle">Últimas conversas ordenadas da mais recente para a mais antiga.</p>
          </div>
          <span className="neo-text--sm neo-text--muted">{messages.length} mensagem(ns)</span>
        </div>

        <MessagesFeed
          viewerId={session.user.id}
          messages={messages}
          emptyDescription="Assim que trocares mensagens com os teus clientes ou equipa vão ficar disponíveis aqui."
        />
      </section>
    </div>
  );
}
