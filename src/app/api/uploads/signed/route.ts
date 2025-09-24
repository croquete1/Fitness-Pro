// src/app/api/uploads/signed/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { canViewClient, ownerFromStoragePath } from '@/lib/acl';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status: 401 });

  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '';
  const owner = ownerFromStoragePath(path);
  if (!owner) return NextResponse.json({ ok:false, error:'BAD_PATH' }, { status:400 });

  const me = auth.user as any;
  const allowed = await canViewClient({ id: me.id, role: me.role }, owner, sb);
  if (!allowed) return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  const { data, error } = await sb.storage.from('workout-photos').createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return NextResponse.json({ ok:false, error: error?.message || 'SIGN_FAILED' }, { status:500 });

  return NextResponse.redirect(data.signedUrl);
}
