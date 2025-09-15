export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');

  const q = (searchParams?.q ?? '').trim();
  const sb = createServerClient();

  let results: { id: string; name: string | null; email: string }[] = [];
  if (q.length >= 2) {
    const { data } = await sb
      .from('users')
      .select('id,name,email')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .order('name', { ascending: true })
      .limit(25);

    results = (data ?? []).map((u) => ({
      id: u.id,
      name: (u as any).name ?? null,
      email: (u as any).email ?? '',
    }));
  }

  return (
    <main className="p-6 space-y-6">
      <PageHeader title="Pesquisar" subtitle={q ? <>Resultados para: <strong>{q}</strong></> : 'Escreve para procurar'} />
      <Card>
        <CardContent>
          {q.length < 2 ? (
            <div className="text-muted small">Escreve pelo menos 2 caracteres.</div>
          ) : results.length === 0 ? (
            <div className="text-muted small">Sem resultados.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {results.map((u) => (
                <li key={u.id}>
                  <strong>{u.name ?? 'Sem nome'}</strong> — {u.email}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
