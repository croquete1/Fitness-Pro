import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export type RowClientPackage = {
  id: string;
  user_id: string;          // id do cliente (consistente com o endpoint [id])
  status?: string | null;
  package_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  expires_at?: string | null;
  [k: string]: unknown;
};

export async function GET(req: Request): Promise<Response> {
  const sessionUser = await getSessionUserSafe();
  const meId = sessionUser?.id ?? null;
  const role = toAppRole(sessionUser?.role) ?? null;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const clientIdParam = url.searchParams.get('clientId'); // opcional: ADMIN/PT podem consultar por cliente
  const statusParam = url.searchParams.get('status');     // opcional

  const sb = createServerClient();

  // Base query (sem genéricos no from/select)
  let q = sb
    .from('client_packages')
    .select('*') // resultados serão “cast” depois
    .order('created_at', { ascending: false });

  // Regras de acesso
  if (role === 'CLIENT') {
    // Cliente só vê os seus próprios pacotes
    q = q.eq('user_id', meId);
  } else if (clientIdParam) {
    // Admin/PT podem filtrar por cliente específico
    q = q.eq('user_id', clientIdParam);
  }

  if (statusParam) {
    q = q.eq('status', statusParam);
  }

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const items = (data ?? []) as RowClientPackage[];
  return NextResponse.json({ ok: true, items });
}
