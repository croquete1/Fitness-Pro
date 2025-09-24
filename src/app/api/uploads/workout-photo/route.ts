// src/app/api/uploads/workout-photo/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ ok:false, error:'MISSING_FILE' }, { status:400 });

  const bucket = 'workout-photos'; // privado
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${auth.user.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg',
  });
  if (upErr) return NextResponse.json({ ok:false, error: upErr.message }, { status:400 });

  return NextResponse.json({ ok:true, path });
}
