'use client';
import DashboardFrame from '@/components/layout/DashboardFrame';
import type { AppRole } from '@/lib/roles';

export default function ClientShell({
  role,
  userLabel,
  children,
}: {
  role: AppRole;
  userLabel: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardFrame role={role} userLabel={userLabel}>
      {children}
    </DashboardFrame>
  );
}
