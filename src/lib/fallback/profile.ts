import { buildProfileDashboard } from '@/lib/profile/dashboard';
import type { ProfileAccount, ProfileDashboardData } from '@/lib/profile/types';

function buildFallbackAccount(overrides: Partial<ProfileAccount> = {}): ProfileAccount {
  return {
    id: overrides.id ?? 'offline-account',
    email: overrides.email ?? '',
    name: overrides.name ?? null,
    username: overrides.username ?? null,
    avatarUrl: overrides.avatarUrl ?? null,
    role: overrides.role ?? null,
    phone: overrides.phone ?? null,
    birthDate: overrides.birthDate ?? null,
    bio: overrides.bio ?? null,
    createdAt: overrides.createdAt ?? null,
    updatedAt: overrides.updatedAt ?? null,
  };
}

export function getProfileDashboardFallback(
  overrides: Partial<ProfileAccount> = {},
): ProfileDashboardData {
  const account = buildFallbackAccount(overrides);
  return buildProfileDashboard(
    {
      account,
      sessions: [],
      requests: [],
      notifications: [],
      devices: [],
      events: [],
    },
    { now: new Date() },
  );
}
