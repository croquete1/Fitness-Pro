// src/app/login/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LoginClient from './LoginClient';

export default async function Page({
  searchParams,
}: { searchParams: { redirect?: string } }) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(searchParams?.redirect || '/dashboard');
  }

  return <LoginClient />;
}
