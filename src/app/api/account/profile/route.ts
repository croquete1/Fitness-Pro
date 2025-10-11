// src/app/api/account/profile/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { syncUserProfile } from '@/lib/profileSync';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get('id') || '');
  const name = (form.get('name') ?? '').toString().trim();
  const avatar_url = (form.get('avatar_url') ?? '').toString().trim();

  const session = await getSessionUserSafe();
  if (!session?.user?.id || String(session.user.id) !== id) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const sb = createServerClient();
  const payload: Record<string, unknown> = {};
  if (name !== '') payload.name = name;
  if (avatar_url !== '') payload.avatar_url = avatar_url;

  if (Object.keys(payload).length) {
    const result = await syncUserProfile(sb, id, payload);
    if (!result.ok) console.warn('[profile] sync error:', result.error);
  }

  return NextResponse.redirect(new URL('/dashboard/admin/profile', req.url));
}
