import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

// Mantém o tipo leve e seguro sem depender do schema inteiro
export type RowClientPackage = {
  id: string;
  user_id: string;
  status?: string | null;
  package_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  expires_at?: string | null;
  [k: string]: unknown;
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const session = await getSessionUserSafe();
  const meId = session?.id ?? null;
  const role = toAppRole(session?.role) ?? null;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();

  // Por omissão: PT/Admin podem ver qualquer registo
  let query = sb
    .from('client_packages')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  // Cliente só pode ver o próprio registo
  if (role === 'CLIENT') {
    query = sb
      .from('client_packages')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', meId)
      .maybeSingle();
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: data as RowClientPackage });
}
