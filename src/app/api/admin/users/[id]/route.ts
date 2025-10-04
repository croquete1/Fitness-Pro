import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabaseServer';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getServiceClient() {
  if (!url || !service) return null;
  return createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
}

const PatchSchema = z.object({
  name: z.string().trim().max(200).nullable().optional(),
  role: z.enum(['ADMIN', 'TRAINER', 'CLIENT']).optional(),
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const json = await req.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const update: Record<string, any> = {};
  for (const k of ['name', 'role', 'approved', 'active'] as const) {
    if (parsed.data[k] !== undefined) update[k] = parsed.data[k];
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true, noop: true });

  const sb = getServiceClient() ?? createServerClient();
  const { error } = await sb.from('users').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const sb = getServiceClient() ?? createServerClient();
  const { data, error } = await sb
    .from('users')
    .select('id,name,email,role,approved,active,created_at')
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ user: data });
}
