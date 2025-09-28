import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';
function isRole(x: any): x is Role {
  return x === 'ADMIN' || x === 'TRAINER' || x === 'CLIENT';
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  try {
    const admin = getAdminClient();
    const body = await _.json().catch(() => ({}));
    const patch: Record<string, any> = {};

    if (body.role !== undefined) {
      const r = String(body.role).toUpperCase();
      if (!isRole(r)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      patch.role = r;
    }
    if (body.approved !== undefined) patch.approved = !!body.approved;
    if (body.active !== undefined) patch.is_active = !!body.active;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    const { data, error } = await admin.from('users').update(patch).eq('id', params.id).select('id, role, approved, is_active').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, user: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
