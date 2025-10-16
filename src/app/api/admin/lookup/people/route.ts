import { NextRequest, NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { appRoleToDbRole, toAppRole } from '@/lib/roles';

const TABLE_CANDIDATES = ['profiles', 'users', 'app_users', 'people', 'people_view'];

function normalizeRoleFilter(value: string) {
  const appRole = toAppRole(value);
  if (!appRole) return null;
  return [appRole];
}

function mapRow(row: any) {
  const role = toAppRole(row?.role ?? null) ?? row?.role ?? null;
  const name = row?.name ?? row?.full_name ?? row?.fullName ?? row?.display_name ?? null;
  return {
    id: String(row?.id ?? row?.user_id ?? ''),
    name,
    email: row?.email ?? row?.contact_email ?? null,
    role,
  };
}

type QueryResult = { rows: any[]; error?: any } | null;

async function fetchFrom(
  table: string,
  opts: {
    id?: string | null;
    search?: string;
    roles?: string[] | null;
    limit?: number;
  },
): Promise<QueryResult> {
  const sb = tryCreateServerClient();
  if (!sb) return { rows: [] };

  try {
    let builder: any = sb.from(table).select('*');
    if (opts.roles?.length) {
      const dbRoles = Array.from(
        new Set(
          opts.roles
            .map((value) => appRoleToDbRole(value))
            .filter((value): value is NonNullable<ReturnType<typeof appRoleToDbRole>> => Boolean(value)),
        ),
      );
      if (dbRoles.length > 0) {
        builder = builder.in('role', dbRoles);
      }
    }
    if (opts.search) {
      const term = opts.search;
      builder = builder.or(`name.ilike.%${term}%,full_name.ilike.%${term}%,email.ilike.%${term}%`);
    }

    const res: any = opts.id
      ? await builder.eq('id', opts.id).maybeSingle()
      : await (opts.limit ? builder.limit(opts.limit) : builder);

    if (res.error) {
      const code = res.error.code ?? res.error.details ?? '';
      if (code === 'PGRST205' || code === 'PGRST301' || code === '42703') return null;
      if (code === 'PGRST116') return { rows: [] };
      return { rows: [], error: res.error };
    }
    const rows = opts.id ? (res.data ? [res.data] : []) : res.data ?? [];
    return { rows };
  } catch (error: any) {
    const code = error?.code ?? error?.message ?? '';
    if (code.includes('PGRST205') || code.includes('PGRST301')) return null;
    return { rows: [], error };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = (searchParams.get('role') || '').trim().toLowerCase();
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const id = searchParams.get('id');

  const roleFilters = role ? normalizeRoleFilter(role) : null;

  const errors: string[] = [];

  for (const table of TABLE_CANDIDATES) {
    const res = await fetchFrom(table, { id, search: q || undefined, roles: roleFilters, limit: id ? 1 : 50 });
    if (!res) continue;
    if (res.error) {
      errors.push(`${table}: ${res.error.message ?? String(res.error)}`);
      continue;
    }
    if (res.rows.length === 0) continue;
    const mapped = res.rows
      .map(mapRow)
      .filter((row) => row.id);
    if (mapped.length === 0) continue;
    const filtered = mapped.filter((row) => {
      if (roleFilters?.length) {
        const rowRole = row.role ? toAppRole(row.role) : null;
        if (!rowRole || !roleFilters.includes(rowRole)) return false;
      }
      if (!q || id) return true;
      const cmp = (value?: string | null) => String(value ?? '').toLowerCase();
      return cmp(row.name).includes(q) || cmp(row.email).includes(q);
    });
    return NextResponse.json({ rows: id ? filtered.slice(0, 1) : filtered.slice(0, 50) });
  }

  if (errors.length) {
    console.warn('[lookup/people] nenhuma tabela devolveu resultados.', errors.join(' | '));
  }

  // fallback: no table matched → empty list
  return NextResponse.json({ rows: [] });
}
