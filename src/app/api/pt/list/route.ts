import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

export async function GET() {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ items: [] }, { status: 401 });
  const role = toAppRole(s.user.role) ?? 'CLIENT';
  if (!(isPT(role) || isAdmin(role))) return NextResponse.json({ items: [] }, { status: 403 });

  const sb = createServerClient();
  const { data } = await sb
    .from('trainer_clients')
    .select('client_id, profiles:profiles!trainer_clients_client_id_fkey(name,email)')
    .eq('trainer_id', s.user.id);

  const items = (data ?? []).map((r: any) => ({
    id: r.client_id,
    label: r.profiles?.name ?? r.profiles?.email ?? r.client_id,
  }));
  return NextResponse.json({ items });
}
