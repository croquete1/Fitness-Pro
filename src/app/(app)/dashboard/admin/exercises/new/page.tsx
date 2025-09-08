import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';
import AdminNewExerciseClient from './AdminNewExerciseClient';

export const metadata: Metadata = { title: 'Novo exercício (Admin) · Fitness Pro' };

export default async function Page() {
  const user = await getSessionUserSafe();
  if (!assertRole(user, ['ADMIN'])) redirect('/dashboard');

  return <AdminNewExerciseClient />;
}
