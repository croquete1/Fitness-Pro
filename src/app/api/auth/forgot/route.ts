// src/app/api/auth/forgot/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch {}
  if (!email) return new NextResponse('Email em falta', { status: 400 });

  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;
  const redirectTo = `${origin}/login/reset`;

  const sb = supabasePublic();
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return new NextResponse(error.message, { status: 400 });

  return NextResponse.json({ ok: true });
}
