// src/lib/logs.ts
import { headers as nextHeaders } from 'next/headers';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

/**
 * Tipos “amigáveis” e extensíveis: podes usar qualquer string,
 * mas tens sugestões comuns abaixo.
 */
export type AuditKind =
  | 'USER_REGISTERED'
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'PLAN_DAY_REORDERED'
  | 'PLAN_ITEM_REORDERED'
  | 'NOTIFICATION_SENT'
  | 'HEALTHCHECK'
  | (string & {}); // permite strings personalizadas mantendo autocomplete

export type AuditPayload = Record<string, unknown>;

/**
 * Escreve um evento de auditoria em `audit_logs`.
 * A tabela deve ter, idealmente: kind (text), payload (jsonb), actor_id (uuid), ip (text), user_agent (text), created_at (timestamptz default now()).
 * Se os nomes diferirem, ajusta os campos no objeto `row`.
 */
export async function writeAudit(kind: AuditKind, payload: AuditPayload = {}) {
  const sb = createServerClient();
  const me = await getSessionUserSafe().catch(() => null);

  const hdrs = await nextHeaders();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    null;
  const ua = hdrs.get('user-agent') || null;

  const row = {
    kind,
    payload,            // ↩ se a coluna no Supabase for `data`, troca para `data: payload`
    actor_id: me?.id ?? null,
    ip,
    user_agent: ua,
  };

  // Sem tipos gerados do Supabase => aceita qualquer shape (compila)
  await sb.from('audit_logs').insert(row);
}

/** Alias p/ compatibilidade com código que use `audit(...)` */
export const audit = writeAudit;