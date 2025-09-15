import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requirePtOrAdminGuard, isGuardErr } from '@/lib/api-guards';

type WalletRow = {
  id: string;
  trainer_id: string;
  delta: number;
  reason: string | null;
  created_at: string;
};

/** GET /api/pt/wallet
 *  PT vê a sua própria carteira; ADMIN pode filtrar por ?trainerId=...
 */
export async function GET(req: Request): Promise<Response> {
  const guard = await requirePtOrAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();

  const url = new URL(req.url);
  const qTrainer = url.searchParams.get('trainerId');
  // ADMIN pode ver de outro trainer via query; PT vê sempre a sua
  const ownerId = guard.me.role === 'ADMIN' && qTrainer ? qTrainer : guard.me.id;

  const { data, error } = await sb
    .from('pt_wallet')
    .select('id,trainer_id,delta,reason,created_at')
    .eq('trainer_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, items: (data ?? []) as WalletRow[] },
    { status: 200 }
  );
}
