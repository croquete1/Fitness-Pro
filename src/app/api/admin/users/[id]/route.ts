// src/app/api/admin/users/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';

async function getAdmin() {
  try {
    // tenta utilitário do teu projeto, se existir
    const mod = await import('@/lib/supabaseAdmin');
    const maybe = (mod as any).supabaseAdmin ?? (mod as any).getSupabaseAdmin ?? (mod as any).default;
    return typeof maybe === 'function' ? maybe() : maybe;
  } catch {}
  // fallback: cria client com service role
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const allowed: any = {};
  if ('name' in body) allowed.name = body.name ?? null;
  if ('role' in body) {
    const r = String(body.role).toUpperCase();
    if (!['ADMIN', 'TRAINER', 'CLIENT'].includes(r)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    allowed.role = r;
  }
  if ('approved' in body) allowed.approved = !!body.approved;
  if ('active' in body) allowed.is_active = !!body.active;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const sb = await getAdmin();
  const { data, error } = await sb
    .from('users')
    .update(allowed)
    .eq('id', id)
    .select('id, name, email, role, approved, is_active, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: String(data.id),
    name: data.name ?? null,
    email: data.email,
    role: data.role,
    approved: Boolean(data.approved),
    active: Boolean(data.is_active ?? true),
    created_at: data.created_at ?? null,
  });
}
