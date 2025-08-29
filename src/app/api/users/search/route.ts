// src/app/api/users/search/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

const esc = (s: string) => `%${s.replace(/[%_]/g, (m) => '\\' + m)}%`;
const onlyDigits = (s: string) => s.replace(/\D/g, '');

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const role = (url.searchParams.get('role') || '').trim().toUpperCase();

  const sb = createServerClient();
  const allowed = new Set(['ADMIN', 'TRAINER', 'CLIENT']);

  let query = sb.from('users').select('id,name,email,role,phone,phone_number').limit(20);
  if (allowed.has(role)) query = query.eq('role', role);

  const ors: string[] = [];
  if (q.length >= 2) {
    const like = esc(q);
    const digits = onlyDigits(q);
    ors.push(`name.ilike.${like}`, `email.ilike.${like}`);
    if (digits) {
      ors.push(`phone.ilike.%${digits}%`, `phone_number.ilike.%${digits}%`);
    }
  }
  if (ors.length) query = query.or(ors.join(','));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data ?? [] });
}
