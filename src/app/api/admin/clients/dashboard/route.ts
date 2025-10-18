import { NextResponse } from 'next/server';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { loadAdminClientsDashboard } from '@/lib/admin/clients/server';

export async function GET(request: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') as '12w' | '24w' | '36w' | null;

  const result = await loadAdminClientsDashboard({ range: range ?? undefined });
  return NextResponse.json({ ok: true, source: result.data.fallback ? 'fallback' : 'supabase', ...result.data });
}
