import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type AnyRow = Record<string, any>;

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);

  const fields = (searchParams.get('fields') || 'role,status')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const { data, error } = await sb.from('users').select(fields.join(','));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const result: Record<string, string[]> = {};
  for (const f of fields) {
    const values = new Set<string>();
    (data as AnyRow[]).forEach((r) => {
      const v = r?.[f];
      if (v != null && String(v).trim() !== '') values.add(String(v));
    });
    result[f] = Array.from(values).sort((a, b) => a.localeCompare(b, 'pt'));
  }

  return NextResponse.json({ ok: true, ...result });
}
