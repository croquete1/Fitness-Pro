import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const role = searchParams.get('role') ?? 'ALL';
  const status = searchParams.get('status') ?? 'ALL';

  const supabase = createServerClient();

  let query = supabase.from('users_view')
    .select('id,name,email,role,status,createdAt')
    .order('createdAt', { ascending: false })
    .limit(200);

  if (q) {
    // ILIKE por nome OU email
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (role !== 'ALL') query = query.eq('role', role);
  if (status !== 'ALL') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}