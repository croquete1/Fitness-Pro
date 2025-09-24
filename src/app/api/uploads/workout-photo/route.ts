// src/app/api/uploads/workout-photo/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  const user = auth?.user;
  if (!user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ ok:false, error:'MISSING_FILE' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const ts = String(now.getTime());
  const safeName = (file.name || 'photo.jpg').replace(/[^a-z0-9_.-]+/gi, '_');
  const path = `${user.id}/${yyyy}/${mm}/${dd}/${ts}_${safeName}`;

  const { error } = await sb.storage.from('workout-photos').upload(path, bytes, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 });

  return NextResponse.json({ ok:true, path });
}
