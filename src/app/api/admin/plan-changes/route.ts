// src/app/api/admin/plan-changes/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const s = supabaseAdmin;
    const { data, error } = await s
      .from('training_plan_changes')
      .select('id,plan_id,actor_id,change_type,diff,created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unexpected error' }, { status: 500 });
  }
}
