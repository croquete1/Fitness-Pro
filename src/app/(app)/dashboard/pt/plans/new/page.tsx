import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import NewPlanClient, { type NewPlanClientProps } from './NewPlanClient';

function normaliseName(record: { full_name?: string | null; name?: string | null; email?: string | null }): string | null {
  if (record.full_name && record.full_name.trim()) return record.full_name.trim();
  if (record.name && record.name.trim()) return record.name.trim();
  if (record.email && record.email.trim()) return record.email.trim();
  return null;
}

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function NewPlanPage({ searchParams }: PageProps) {
  const sb = createServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const clients: NewPlanClientProps['clients'] = [];
  try {
    const { data } = await sb
      .from('profiles')
      .select('id, full_name, name')
      .order('full_name', { ascending: true })
      .limit(120);
    for (const entry of data ?? []) {
      const label = normaliseName(entry) ?? entry.id;
      clients.push({ id: entry.id, name: label, email: null });
    }
  } catch {
    // fallback sem bloquear a página
  }

  const templates: NewPlanClientProps['templates'] = [];
  try {
    const { data } = await sb
      .from('training_plans')
      .select('id, title, status, client_id, is_template, updated_at')
      .eq('trainer_id', user.id)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(60);

    for (const entry of data ?? []) {
      const planType = entry.is_template
        ? 'template'
        : entry.client_id
          ? 'client'
          : 'unassigned';
      templates.push({
        id: entry.id,
        title: (entry.title ?? 'Plano sem título').trim() || 'Plano sem título',
        status: entry.status ?? null,
        updatedAt: entry.updated_at ?? null,
        planType,
      });
    }
  } catch {
    // ignorar falhas neste bloco
  }

  const clientIdParam = Array.isArray(searchParams?.clientId)
    ? searchParams?.clientId[0]
    : searchParams?.clientId;
  const defaultClientId = typeof clientIdParam === 'string' ? clientIdParam : '';

  return (
    <div className="max-w-3xl space-y-6">
      <NewPlanClient clients={clients} templates={templates} defaultClientId={defaultClientId || undefined} />
    </div>
  );
}
