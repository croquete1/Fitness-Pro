// src/app/api/admin/users/send-recovery/route.ts
import { NextResponse, type NextRequest } from 'next/server';

async function getAdmin() {
  try {
    const mod = await import('@/lib/supabaseAdmin');
    const maybe = (mod as any).supabaseAdmin ?? (mod as any).getSupabaseAdmin ?? (mod as any).default;
    return typeof maybe === 'function' ? maybe() : maybe;
  } catch {}
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const admin = await getAdmin();
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    // opcional: redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login/reset`
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // devolvemos o action_link (útil para copiar manualmente em dev)
  return NextResponse.json({ ok: true, action_link: data?.properties?.action_link ?? null });
}
