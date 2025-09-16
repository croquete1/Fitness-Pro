// src/app/api/admin/plan-changes/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';

export async function GET() {
  try {
    const s = supabaseAdmin();
    const { data, error } = await s
      .from('training_plan_changes')
      .select('id,plan_id,actor_id,change_type,diff,created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ error: 'fail' }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 });
  }
}
