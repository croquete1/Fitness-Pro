// src/app/api/uploads/signed/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  if (!path) return NextResponse.json({ ok:false, error:'MISSING_PATH' }, { status: 400 });

  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  const me = auth?.user;
  if (!me?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status: 401 });

  // Gate simples: só o dono (ou ADMIN) pode assinar a sua foto
  const role = (me as any).role ?? null;
  const isAdmin = String(role ?? '').toUpperCase() === 'ADMIN';
  if (!isAdmin && !String(path).startsWith(`${me.id}/`)) {
    return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status: 403 });
  }

  const { data, error } = await sb.storage.from('workout-photos').createSignedUrl(path, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ ok:false, error: error?.message || 'SIGN_FAILED' }, { status: 400 });

  // Redireciona para o URL assinado para poder usar diretamente em <img src="">
  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
