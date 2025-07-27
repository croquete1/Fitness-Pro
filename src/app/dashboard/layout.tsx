// src/app/dashboard/layout.tsx

import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth-server';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getAuthSession();

  if (!session) {
    // redireciona para a página de login se não estiver autenticado
    redirect('/login');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {children}
    </div>
  );
}
