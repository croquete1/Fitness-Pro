export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import Editor from './ui';

export default async function EditPlanPage({ params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data } = await sb.from('training_plans').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  return <Editor initial={data} />;
}
