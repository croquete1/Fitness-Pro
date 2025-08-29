export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb.from('users').select('id,name,email,role,phone,status,created_at').eq('id', params.id).single();

  if (!data) return <div style={{ padding: 16 }}>Utilizador não encontrado.</div>;

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>{data.name ?? data.email}</h1>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Email</div>{data.email}</div>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Telefone</div>{data.phone ?? '—'}</div>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Role</div><span className="badge">{data.role}</span></div>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Estado</div><span className="badge">{data.status}</span></div>
          <div><div className="text-muted" style={{ fontSize: 12 }}>Criado</div>{data.created_at ? new Date(data.created_at).toLocaleString() : '—'}</div>
        </div>
      </div>
    </div>
  );
}
