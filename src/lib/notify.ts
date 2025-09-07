// src/lib/notify.ts
import { createServerClient } from '@/lib/supabaseServer';

type BasePayload = { userId: string; title: string; body?: string; link?: string };

export async function createNotification(p: BasePayload) {
  const sb = createServerClient();
  await sb.from('notifications').insert({
    user_id: p.userId,
    title: p.title,
    body: p.body ?? null,
    link: p.link ?? null,
    read: false,
  });
}

export async function notifyPlanCreated(clientId: string, planId: string, planTitle?: string | null) {
  await createNotification({
    userId: clientId,
    title: 'Novo plano de treino',
    body: planTitle ? `Plano: ${planTitle}` : undefined,
    link: '/dashboard/my-plan',
  });
}

export async function notifyPlanUpdated(clientId: string, planId: string, planTitle?: string | null) {
  await createNotification({
    userId: clientId,
    title: 'Plano atualizado',
    body: planTitle ? `Plano: ${planTitle}` : undefined,
    link: '/dashboard/my-plan',
  });
}

export async function notifyDayNotesUpdated(clientId: string, planId: string, dayLabel: string) {
  await createNotification({
    userId: clientId,
    title: 'Notas do treino atualizadas',
    body: `Notas do dia ${dayLabel}`,
    link: '/dashboard/my-plan',
  });
}
