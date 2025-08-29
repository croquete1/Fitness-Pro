import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/authz';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ('error' in guard) return guard.error;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q || q.length < 2) return NextResponse.json({ items: [] });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('exercises')
    .select('id,name,media_url,muscle_image_url')
    .ilike('name', `%${q}%`)
    .limit(20);

  if (error) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: data ?? [] });
}
