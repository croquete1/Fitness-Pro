// src/lib/acl.ts
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export function ownerFromStoragePath(path: string): string | null {
  // Ex.: "<userId-uuid>/timestamp.ext"
  const m = path?.match(/^([0-9a-fA-F-]{36})\//);
  return m?.[1] ?? null;
}

export async function isAssignedPT(ptId: string, clientId: string, sb = createServerClient()) {
  // PT atribuído se tiver plano OU sessão com o cliente
  const { data: p } = await sb.from('training_plans').select('id').eq('trainer_id', ptId).eq('client_id', clientId).limit(1);
  if (p?.length) return true;
  const { data: s } = await sb.from('sessions').select('id').eq('trainer_id', ptId).eq('client_id', clientId).limit(1);
  return !!(s?.length);
}

export async function canViewClient(me: { id: string; role?: any }, targetId: string, sb = createServerClient()) {
  if (!me?.id || !targetId) return false;
  if (me.id === targetId) return true;
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role === 'ADMIN') return true;
  if (role === 'PT') return isAssignedPT(me.id, targetId, sb);
  return false;
}

export async function assertCanViewClient(me: { id: string; role?: any }, targetId: string, sb = createServerClient()) {
  const ok = await canViewClient(me, targetId, sb);
  if (!ok) {
    const err = new Error('FORBIDDEN');
    (err as any).status = 403;
    throw err;
  }
}