import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const esc = (s: string) => `%${s.replace(/[%_]/g, (m) => '\\' + m)}%`;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const muscle = (url.searchParams.get('muscle') || '').trim();

  const sb = createServerClient();

  // Espera-se tabela `exercises` com colunas:
  // id, name, media_url, muscle_image_url, primary_muscle, equipment
  let query = sb.from('exercises')
    .select('id,name,media_url,muscle_image_url,primary_muscle,equipment')
    .limit(40);

  const ors: string[] = [];
  if (q.length >= 2) {
    ors.push(`name.ilike.${esc(q)}`);
    // Opcional: notas/palavras-chave se existirem
    // ors.push(`keywords.ilike.${esc(q)}`);
  }
  if (ors.length) query = query.or(ors.join(','));

  if (muscle) query = query.eq('primary_muscle', muscle);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ exercises: data ?? [] });
}
