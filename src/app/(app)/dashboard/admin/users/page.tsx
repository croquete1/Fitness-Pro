// src/app/(app)/dashboard/admin/users/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UsersClient from '@/components/admin/UsersClient';


function isAdmin(role: unknown) {
  return String(role ?? '').toUpperCase() === 'ADMIN';
}

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function toStringParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v || '';
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin((session.user as any)?.role)) {
    return <div className="card" style={{ padding: 16 }}>Acesso negado.</div>;
  }

  const params = new URLSearchParams();
  const keys = ['q', 'role', 'status', 'sort', 'page', 'pageSize'] as const;
  keys.forEach((k) => {
    const v = toStringParam(searchParams[k]);
    if (v) params.set(k, v);
  });

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/users?${params.toString()}`, { cache: 'no-store' })
    .catch(() => null);

  // fallback: SSR direto em dev sem NEXT_PUBLIC_BASE_URL
  let initial;
  if (!res || !res.ok) {
    const r = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/admin/users?${params.toString()}`, { cache: 'no-store' }).catch(() => null);
    initial = r && r.ok ? await r.json() : { page: 1, pageSize: 20, total: 0, pages: 1, items: [] };
  } else {
    initial = await res.json();
  }

  return <UsersClient initial={initial} />;
}
