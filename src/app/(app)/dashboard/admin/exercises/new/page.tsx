export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

async function createExercise(formData: FormData) {
  'use server';
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);
  if (toAppRole(user.role) !== 'ADMIN') redirect('/dashboard' as Route);

  const name = String(formData.get('name') || '').trim();
  const muscle_group = String(formData.get('muscle_group') || '').trim() || null;
  const equipment = String(formData.get('equipment') || '').trim() || null;
  const difficulty = String(formData.get('difficulty') || '').trim() || null;
  const video_url = String(formData.get('video_url') || '').trim() || null;

  if (!name) return;

  const sb = createServerClient();
  await sb.from('exercises').insert({
    name, muscle_group, equipment, difficulty, video_url, created_by: user.id,
  });

  revalidatePath('/dashboard/admin/exercises');
  redirect('/dashboard/admin/exercises' as Route);
}

export default async function AdminNewExercisePage() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);
  if (toAppRole(user.role) !== 'ADMIN') redirect('/dashboard' as Route);

  return (
    <main className="p-4 space-y-4">
      <PageHeader title="Novo exercício" subtitle="Adicionar ao catálogo" />
      <Card>
        <CardContent>
          <form action={createExercise} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
            <label>
              <div className="small text-muted">Nome *</div>
              <input name="name" required placeholder="Agachamento" />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label>
                <div className="small text-muted">Grupo muscular</div>
                <input name="muscle_group" placeholder="Pernas / Peito / Costas…" />
              </label>
              <label>
                <div className="small text-muted">Equipamento</div>
                <input name="equipment" placeholder="Halteres / Barra / Máquina…" />
              </label>
            </div>

            <label>
              <div className="small text-muted">Dificuldade</div>
              <select name="difficulty" defaultValue="">
                <option value="">—</option>
                <option value="EASY">Fácil</option>
                <option value="MEDIUM">Médio</option>
                <option value="HARD">Difícil</option>
              </select>
            </label>

            <label>
              <div className="small text-muted">Vídeo (URL)</div>
              <input name="video_url" type="url" placeholder="https://…" />
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" type="submit">Guardar</button>
              <a className="btn ghost" href={'/dashboard/admin/exercises' as Route}>Cancelar</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
