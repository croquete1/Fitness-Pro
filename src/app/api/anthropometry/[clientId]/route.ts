// src/app/api/anthropometry/[clientId]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  _req: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;
    const { data, error } = await supabaseAdmin
      .from('anthropometry')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
