import { createServerClient } from '@/lib/supabaseServer';
import PlansGrid, { type PlanRow } from './plans.client';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const sb = createServerClient();

  let rows: PlanRow[] = [];
  try {
    // ⚠️ Ajusta as colunas ao teu schema (title, status, owner/trainer, updated_at, is_active)
    const { data, error } = await sb
      .from('plans' as any)
      .select('id, title, status, owner_id, trainer_id, updated_at, is_active')
      .order('updated_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      rows = data.map((p: any) => ({
        id: String(p.id),
        title: p.title ?? '(sem título)',
        status: String(p.status ?? 'DRAFT').toUpperCase(),
        owner: p.owner_id ? String(p.owner_id) : null,
        trainer: p.trainer_id ? String(p.trainer_id) : null,
        updated_at: p.updated_at ?? null,
        active: Boolean(p.is_active ?? true),
      }));
    }
  } catch {}

  return <PlansGrid rows={rows} />;
}
