// src/lib/notify.ts
import { createServerClient } from '@/lib/supabaseServer';

export type NotifyResult = { ok: true } | { ok: false; reason: string };

type SB = ReturnType<typeof createServerClient>;

async function insertNotification(
  sb: SB,
  userId: string,
  title: string,
  body: string,
  link?: string | null
): Promise<NotifyResult> {
  try {
    const { error } = await sb.from('notifications').insert({
      user_id: userId,
      title,
      body,
      link: link ?? null,
      read: false,
      created_at: new Date().toISOString(),
    } as any);

    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'unknown' };
  }
}

/** Novo plano criado -> notifica cliente */
export async function notifyPlanCreated(
  sb: SB,
  clientId: string,
  planId: string
): Promise<NotifyResult> {
  const link = `/dashboard/my-plan?plan=${encodeURIComponent(planId)}`;
  return insertNotification(
    sb,
    clientId,
    'Novo plano de treino',
    'Foi criado um novo plano de treino.',
    link
  );
}

/** Plano atualizado (genérico) -> notifica cliente */
export async function notifyPlanUpdated(
  sb: SB,
  clientId: string,
  planId: string
): Promise<NotifyResult> {
  const link = `/dashboard/my-plan?plan=${encodeURIComponent(planId)}`;
  return insertNotification(
    sb,
    clientId,
    'Plano atualizado',
    'O teu plano de treino foi atualizado.',
    link
  );
}

/**
 * Notas do dia de treino atualizadas -> notifica cliente
 * 4º argumento (dayIso) é OPCIONAL para manter compatibilidade com chamadas a 3 args.
 */
export async function notifyPlanDayNotesUpdated(
  sb: SB,
  clientId: string,
  planId: string,
  dayIso?: string
): Promise<NotifyResult> {
  const link = `/dashboard/my-plan?plan=${encodeURIComponent(planId)}${
    dayIso ? `&day=${encodeURIComponent(dayIso)}` : ''
  }`;
  const body = dayIso
    ? `As notas do dia ${dayIso} foram atualizadas.`
    : 'Notas de treino atualizadas.';

  return insertNotification(
    sb,
    clientId,
    'Notas do treino atualizadas',
    body,
    link
  );
}
