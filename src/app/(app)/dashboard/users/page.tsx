import UsersClient, { AdminUserRow } from './UsersClient';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabase = createServerClient();
  // carregamento inicial (nome/email/role/status) — pesquisa refinada é feita no cliente
  const { data } = await supabase
    .from('users_view') // usa uma view ou a tua tabela normalizada
    .select('id,name,email,role,status,createdAt')
    .order('createdAt', { ascending: false })
    .limit(100);

  return <UsersClient initial={(data ?? []) as AdminUserRow[]} />;
}