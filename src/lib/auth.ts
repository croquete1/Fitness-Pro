export type Role = 'ADMIN' | 'PT' | 'CLIENT';

export function canManageExercises(role?: Role | null) {
  return role === 'ADMIN' || role === 'PT';
}
