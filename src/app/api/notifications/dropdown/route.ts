import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { requireUserGuard, isGuardErr } from '@/lib/api-guards';

const FALLBACK_ITEMS = [
  { id: 'fallback-1', title: 'Bem-vindo à HMS Personal Trainer', href: '/dashboard' },
  { id: 'fallback-2', title: 'Actualiza o teu perfil para personalizar a experiência.', href: '/dashboard/profile' },
];

export async function GET() {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson({ items: FALLBACK_ITEMS });
  }

  try {
    const { me } = guard;
    const { data, error } = await sb
      .from('notifications')
      .select('id, title, created_at, user_id, href')
      .eq('active', true)
      .or(`user_id.is.null,user_id.eq.${me.id}`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    const items = (data ?? []).map((row) => ({
      id: String(row?.id ?? crypto.randomUUID?.() ?? Date.now()),
      title: String(row?.title ?? 'Notificação'),
      href: row?.href ?? null,
      created_at: row?.created_at ?? null,
    }));

    return NextResponse.json({ items }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[notifications/dropdown] erro', { code });
    return NextResponse.json(
      { items: [], error: 'UNAVAILABLE' },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }
}
