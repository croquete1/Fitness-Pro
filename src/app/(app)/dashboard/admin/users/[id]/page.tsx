import * as React from 'react';
import { notFound } from 'next/navigation';

import { createServerClient } from '@/lib/supabaseServer';
import { fetchUserById } from '@/lib/userRepo';
import UserFormClient, { type Role, type Status } from '../UserFormClient';

export const dynamic = 'force-dynamic';

function asRole(value: any): Role {
  const normalised = String(value ?? '').toLowerCase();
  if (normalised === 'admin' || normalised === 'trainer' || normalised === 'client') {
    return normalised as Role;
  }
  return 'client';
}

function asStatus(value: any): Status {
  const normalised = String(value ?? '').toLowerCase();
  if (normalised === 'active' || normalised === 'inactive') {
    return normalised as Status;
  }
  return 'active';
}

function mapRow(row: any) {
  return {
    id: String(row.id),
    name: row.name ?? row.full_name ?? '',
    email: row.email ?? row.mail ?? '',
    role: asRole(row.role ?? row.user_role),
    status: asStatus(row.status ?? row.state),
    approved: Boolean(row.approved ?? row.is_approved ?? true),
    active: Boolean(row.active ?? row.is_active ?? true),
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = createServerClient();

  const data = await fetchUserById(id, { client });
  if (!data) return notFound();

  return (
    <div className="admin-user-form-page">
      <UserFormClient mode="edit" initial={mapRow(data)} />
    </div>
  );
}

