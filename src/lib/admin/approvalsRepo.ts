// src/lib/admin/approvalsRepo.ts
import { createServerClient } from '@/lib/supabaseServer';

export type ApprovalItem = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;    // 'ADMIN' | 'PT' | 'CLIENT' | ...
  status: string | null;  // 'PENDING' | 'ACTIVE' | 'SUSPENDED' | ...
  createdAt: string;
};

/** Lista utilizadores em aprovação (status = PENDING) */
export async function listPendingApprovals(): Promise<ApprovalItem[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('users')
    .select('id, name, email, role, status, created_at')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map((u: any) => ({
    id: String(u.id),
    name: u.name ?? null,
    email: String(u.email),
    role: u.role ?? null,
    status: u.status ?? null,
    createdAt: (u.created_at && typeof u.created_at === 'string')
      ? u.created_at
      : new Date().toISOString(),
  }));
}

/** Atualiza o estado do utilizador (ex.: aprovar / rejeitar) */
export async function setUserStatus(
  id: string,
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sb = createServerClient();
  const { error } = await sb
    .from('users')
    .update({ status })
    .eq('id', id);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
