// src/app/(app)/dashboard/admin/approvals/page.tsx
import AdminApprovalsClient from '@/components/admin/AdminApprovalsClient';
import createServerClient from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  approved?: boolean | null;
};

export default async function Page() {
  const sb = createServerClient();

  const { data } = await sb
    .from('users')
    .select('id,name,email,role,created_at,approved')
    .order('created_at', { ascending: false });

  // ✅ passa 'initial', que é o que o componente espera
  return <AdminApprovalsClient initial={(data ?? []) as Row[]} />;
}
