export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import AdminApprovalsClient from '@/components/admin/AdminApprovalsClient';

export default async function ApprovalsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  // compat: approved=false OR status='PENDING'
  const { data: rowsA } = await sb.from('users').select('id,name,email,role,created_at').eq('approved', false);
  const { data: rowsB } = await sb.from('users').select('id,name,email,role,created_at').eq('status', 'PENDING');
  const map = new Map<string, any>();
  (rowsA ?? []).forEach((u: any) => map.set(u.id, u));
  (rowsB ?? []).forEach((u: any) => map.set(u.id, u));
  const rows = Array.from(map.values()).sort((a,b) => +new Date(b.created_at||0) - +new Date(a.created_at||0));

  return <AdminApprovalsClient initial={rows} />;
}
