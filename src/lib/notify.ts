import webpush from 'web-push';
type SB = ReturnType<typeof import('@/lib/supabaseServer').createServerClient>;

export type NotifInput = { user_id: string; title: string; body?: string | null; link?: string | null; };

function getVapid() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || '';
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY || '';
  const email = process.env.WEB_PUSH_CONTACT || 'mailto:admin@example.com';
  if (!publicKey || !privateKey) return { ok: false as const };
  webpush.setVapidDetails(email, publicKey, privateKey);
  return { ok: true as const };
}

export async function createAndPush(sb: SB, notif: NotifInput) {
  const { data, error } = await sb
    .from('notifications')
    .insert({
      user_id: notif.user_id, title: notif.title, body: notif.body ?? null,
      link: notif.link ?? null, read: false
    })
    .select('id,user_id,title,body,link,created_at')
    .single();
  if (error) throw error;

  const cfg = getVapid();
  if (cfg.ok) {
    const { data: subs = [] } = await sb
      .from('push_subscriptions')
      .select('endpoint,p256dh,auth')
      .eq('user_id', notif.user_id);

    await Promise.all(subs.map(async (s) => {
      try {
        await (await import('web-push')).default.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any,
          JSON.stringify({ title: notif.title, body: notif.body ?? undefined, data: { url: notif.link ?? undefined } })
        );
      } catch {}
    }));
  }
  return data;
}

export async function notifyPlanCreated(sb: SB, clientId: string, planId: string) {
  await createAndPush(sb, {
    user_id: clientId,
    title: 'Novo plano de treino disponível',
    body: 'O teu personal trainer criou um novo plano de treino.',
    link: `/dashboard/pt/plans/${planId}/page`,
  });
}
export async function notifyPlanUpdated(sb: SB, clientId: string, planId: string) {
  await createAndPush(sb, {
    user_id: clientId,
    title: 'Plano de treino atualizado',
    body: 'O teu plano foi atualizado.',
    link: `/dashboard/pt/plans/${planId}/page`,
  });
}
export async function notifyPlanDayNotesUpdated(sb: SB, clientId: string, planId: string, dayIso: string) {
  await createAndPush(sb, {
    user_id: clientId,
    title: 'Notas do treino atualizadas',
    body: `As notas do dia ${new Date(dayIso).toLocaleDateString('pt-PT')} foram atualizadas.`,
    link: `/dashboard/pt/plans/${planId}/page?focus=${dayIso}`,
  });
}
