export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import type { Route } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import FitnessQuestionnaireForm from '@/components/questionnaire/FitnessQuestionnaireForm';
import QuestionnaireNotesPanel from '@/components/questionnaire/QuestionnaireNotesPanel';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export default async function ClientProfile({ params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getSessionUserSafe();
  const viewer = (session as any)?.user;
  if (!viewer?.id) redirect('/login' as Route);
  if (toAppRole(viewer.role) !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  const { data: c } = await sb
    .from('users')
    .select('id,name,email,role,status,created_at,updated_at')
    .eq('id', id)
    .single();

  if (!c) return notFound();

  const { data: questionnaire } = await sb
    .from('fitness_questionnaire')
    .select('*')
    .eq('user_id', id)
    .maybeSingle();

  const viewerName = session?.name ?? session?.user?.name ?? null;
  const questionnaireId = questionnaire?.id ?? null;

  const sourceTimestamp = c.updated_at ?? c.created_at ?? null;

  return (
    <div className="neo-stack neo-stack--xl p-4 md:p-6">
      <PageHeader
        title={`🧑‍🤝‍🧑 ${c.name ?? c.email}`}
        subtitle={
          <div className="client-admin__headerMeta">
            <Badge variant="neutral">CLIENT</Badge>
            <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'PENDING' ? 'warning' : 'neutral'}>
              {c.status}
            </Badge>
            <DataSourceBadge source="supabase" generatedAt={sourceTimestamp} />
          </div>
        }
      />
      <Card>
        <CardContent className="neo-stack neo-stack--md">
          <div className="client-admin__meta neo-grid neo-grid--auto">
            <div>
              <span className="neo-text--xs neo-text--muted">ID</span>
              <p className="neo-text--md">{c.id}</p>
            </div>
            <div>
              <span className="neo-text--xs neo-text--muted">Email</span>
              <p className="neo-text--md">{c.email}</p>
            </div>
            <div>
              <span className="neo-text--xs neo-text--muted">Criado em</span>
              <p className="neo-text--md">{formatDate(c.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FitnessQuestionnaireForm
        initial={questionnaire ?? null}
        mode="admin"
        targetUserId={id}
        viewerName={viewerName}
      />
      <Card>
        <CardContent>
          <QuestionnaireNotesPanel questionnaireId={questionnaireId} viewerRole="ADMIN" />
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return '—';
  }
}
