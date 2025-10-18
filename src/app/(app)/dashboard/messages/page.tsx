export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import MessagesFeed, { type MessageRow } from '@/app/(app)/dashboard/messages/_components/MessagesFeed';

export default async function ClientMessagesPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb
    .from('messages')
    .select('id,body,sent_at,from_id,to_id')
    .or(`from_id.eq.${session.user.id},to_id.eq.${session.user.id}`)
    .order('sent_at', { ascending: false })
    .limit(120);

  const messages: MessageRow[] = (data ?? []) as MessageRow[];

  return (
    <div className="neo-stack neo-stack--xl">
      <header className="page-header neo-panel neo-panel--header">
        <div className="page-header__body">
          <h1 className="page-header__title heading-solid">Mensagens</h1>
          <p className="page-header__subtitle">
            Conversas trocadas com o teu PT ou com a equipa de suporte.
          </p>
        </div>
      </header>

      <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="messages-heading">
        <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div>
            <h2 id="messages-heading" className="neo-panel__title">
              Histórico de mensagens
            </h2>
            <p className="neo-panel__subtitle">Mostramos as tuas últimas interações por ordem cronológica.</p>
          </div>
          <span className="neo-text--sm neo-text--muted">{messages.length} mensagem(ns)</span>
        </div>

        <MessagesFeed viewerId={session.user.id} messages={messages} />
      </section>
    </div>
  );
}
