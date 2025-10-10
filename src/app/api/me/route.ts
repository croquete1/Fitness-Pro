import { NextResponse } from 'next/server';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';

export async function GET() {
  const sb = await tryGetSBC();
  if (!sb) return supabaseFallbackJson({ label: null });
  const { data: auth } = await sb.auth.getUser();
  const authUser = auth?.user;

  if (!authUser) return NextResponse.json({ label: null });

  // tenta users.name pelo auth_id; fallback para email do auth
  const { data } = await sb.from('users')
    .select('name,email,auth_id')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  const label = data?.name || data?.email || authUser.email || null;
  return NextResponse.json({ label });
}
