// src/app/api/dashboard/users/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard,isGuardErr } from '@/lib/api-guards';

type RowUser = {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'PT' | 'CLIENT' | string | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | string | null;
  created_at: string | null;
};

export async function GET(): Promise<Response> {
  // Apenas ADMIN
  const guard = await requireAdminGuard();
if (isGuardErr(guard)) return guard.response;


  const sb = createServerClient();

  try {
    const { data, error } = await sb
      .from('users')
      .select('id, name, email, role, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const users = (data as RowUser[] | null ?? []).map((u) => ({
      id: u.id,
      name: u.name ?? null,
      email: u.email,
      role: (u.role ?? 'CLIENT') as string,
      status: (u.status ?? 'ACTIVE') as string,
      createdAt: u.created_at,
    }));

    return NextResponse.json({ ok: true, users });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'fetch_failed' },
      { status: 500 }
    );
  }
}
