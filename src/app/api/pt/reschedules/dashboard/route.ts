import { NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { loadTrainerReschedulesDashboard } from '@/lib/trainer/reschedules/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = createServerClient();
  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, message: 'Autenticação necessária.' }, { status: 401 });
  }

  const role = toAppRole(user.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, message: 'Sem permissões para consultar remarcações.' }, { status: 403 });
  }

  const payload = await loadTrainerReschedulesDashboard(user.id);
  return NextResponse.json(payload, { headers: { 'cache-control': 'no-store' } });
}
