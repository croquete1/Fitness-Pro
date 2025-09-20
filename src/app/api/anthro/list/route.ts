import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ items: [] }, { status: 401 });

  const sb = createServerClient();
  const { data } = await sb
    .from('anthropometrics')
    .select('id,measured_at,weight_kg,body_fat_pct,height_cm,chest_cm,waist_cm,hip_cm,notes')
    .eq('user_id', s.user.id)
    .order('measured_at', { ascending: false })
    .limit(180);

  return NextResponse.json({ items: data ?? [] });
}
