// src/app/api/metrics/sessions-7d/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';

export async function GET() {
  try {
    const s = supabaseAdmin();
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);

    const { count, error } = await s
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', start.toISOString())
      .lt('scheduled_at', now.toISOString());

    if (error) return NextResponse.json({ error: 'fail' }, { status: 500 });

    return NextResponse.json({ range: '7d', count: count ?? 0 });
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 });
  }
}
