// src/lib/cache-tags.ts
export const TAG = {
  USERS: 'users',
  PROFILES: 'profiles',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  SIGNUPS: 'signups',
  METRICS: 'metrics',
} as const;

export type TagKey = typeof TAG[keyof typeof TAG];
