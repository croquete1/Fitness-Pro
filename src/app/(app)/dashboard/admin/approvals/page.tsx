// src/app/(app)/dashboard/admin/approvals/page.tsx
import AdminApprovalsClient from '@/components/admin/AdminApprovalsClient';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id,name,email,role,created_at,approved')
    .eq('approved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/approvals] list error:', error);
  }

  // AdminApprovalsClient espera prop { initial: Row[] }
  const initial = (data ?? []).map((u) => ({
    id: u.id,
    name: u.name ?? '',
    email: u.email ?? '',
    role: u.role ?? 'client',
    created_at: u.created_at ?? null,
    approved: u.approved ?? false,
  }));

  return <AdminApprovalsClient initial={initial} />;
}
