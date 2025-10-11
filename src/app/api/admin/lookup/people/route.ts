import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = (searchParams.get('role') || '').trim().toLowerCase();
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const id = searchParams.get('id');

  // Base: tabela 'users'
  const selectColumns = 'id, name, email, role';
  let query = sb.from('users').select(selectColumns).limit(50);

  const normalizeRoleFilter = (value: string) => {
    const appRole = toAppRole(value);
    if (!appRole) return null;
    if (appRole === 'PT') return ['PT', 'TRAINER'];
    return [appRole];
  };

  if (role) {
    const roleFilters = normalizeRoleFilter(role);
    if (roleFilters?.length) {
      query = query.in('role', roleFilters);
    }
  }

  const fetchProfilesByIds = async (ids: string[]) => {
    if (!ids.length) return new Map<string, any>();
    const { data } = await sb.from('profiles').select('id, full_name, name, email, role').in('id', ids);
    return new Map<string, any>((data ?? []).map((row: any) => [String(row.id), row]));
  };

  if (id) {
    const one = await query.eq('id', id).maybeSingle();
    if (one.error && one.error.code !== 'PGRST116') {
      return NextResponse.json({ rows: [], error: one.error.message }, { status: 400 });
    }

    const record = one.data as any | null;
    if (!record) {
      const profile = await sb.from('profiles').select('id, full_name, email, role').eq('id', id).maybeSingle();
      if (profile.error || !profile.data) return NextResponse.json({ rows: [] });
      const appRole = toAppRole(profile.data.role ?? null);
      return NextResponse.json({
        rows: [
          {
            id: String(profile.data.id),
            name: profile.data.full_name ?? null,
            email: profile.data.email ?? null,
            role: appRole ?? profile.data.role ?? null,
          },
        ],
      });
    }

    const profileMap = await fetchProfilesByIds([String(record.id)]);
    const profile = profileMap.get(String(record.id));
    const appRole = toAppRole(record.role ?? profile?.role ?? null);
    return NextResponse.json({
      rows: [
        {
          id: String(record.id),
          name: record.name ?? profile?.full_name ?? profile?.name ?? null,
          email: record.email ?? profile?.email ?? null,
          role: appRole ?? record.role ?? null,
        },
      ],
    });
    return NextResponse.json({ rows: id ? filtered.slice(0, 1) : filtered.slice(0, 50) });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ rows: [], error: error.message }, { status: 400 });

  const userRows = (data ?? []).map((row: any) => ({
    id: String(row.id),
    name: row.name ?? null,
    email: row.email ?? null,
    role: row.role ?? null,
  }));

  const missingProfileIds = userRows.filter((row) => !row.name).map((row) => row.id);
  const profiles = await fetchProfilesByIds(missingProfileIds);

  const mapped = userRows
    .map((row) => {
      const profile = profiles.get(row.id);
      const appRole = toAppRole(row.role ?? profile?.role ?? null);
      return {
        id: row.id,
        name: row.name ?? profile?.full_name ?? profile?.name ?? null,
        email: row.email ?? profile?.email ?? null,
        role: appRole ?? row.role ?? null,
      };
    })
    .filter((r) => {
      if (!q) return true;
      return String(r.name ?? '').toLowerCase().includes(q) || String(r.email ?? '').toLowerCase().includes(q);
    });

  if (mapped.length === 0 && !q) {
    const { data: fallbackProfiles } = await sb
      .from('profiles')
      .select('id, full_name, email, role')
      .limit(50);
    const rows = (fallbackProfiles ?? []).map((profile: any) => ({
      id: String(profile.id),
      name: profile.full_name ?? profile.name ?? null,
      email: profile.email ?? null,
      role: toAppRole(profile.role ?? null) ?? profile.role ?? null,
    }));
    return NextResponse.json({ rows });
  }

  return NextResponse.json({ rows: mapped.slice(0, 50) });
}
