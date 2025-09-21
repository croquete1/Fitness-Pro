export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import supabaseAdmin from '@/lib/supabaseServer';


export default async function AdminExercisesPage() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);

  const role = toAppRole(user.role) ?? 'CLIENT';
  const canCreate = role === 'ADMIN';

  const sb = supabaseAdmin;
  const { data: rows, error } = await sb
    .from('exercises')
    .select('id,name,muscle_group,equipment,difficulty,video_url,created_at,created_by')
    .order('created_at', { ascending: false })
    .limit(200);

  const items =
    error || !rows
      ? []
      : rows;

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title="Catálogo de Exercícios"
        subtitle="Gerir e pesquisar exercícios"
        actions={
          canCreate
            ? <Link href={'/dashboard/admin/exercises/new' as Route} className="btn primary">➕ Novo exercício</Link>
            : null
        }
      />

      <Card>
        <CardContent>
          {!items.length ? (
            <div className="text-muted small">Sem exercícios no catálogo.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
              {items.map((e) => (
                <li key={e.id} className="card" style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'grid', gap: 4 }}>
                      <div style={{ fontWeight: 700 }}>{e.name}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {e.muscle_group ? <Badge variant="primary">{e.muscle_group}</Badge> : null}
                        {e.equipment ? <Badge variant="neutral">{e.equipment}</Badge> : null}
                        {e.difficulty ? (
                          <Badge
                            variant={
                              e.difficulty === 'EASY' ? 'success'
                              : e.difficulty === 'HARD' ? 'danger'
                              : 'warning'
                            }
                          >
                            {e.difficulty}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    {e.video_url ? (
                      <a href={e.video_url} target="_blank" rel="noreferrer" className="btn chip">🎬 Vídeo</a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
