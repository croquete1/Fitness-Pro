// src/app/(app)/dashboard/layout.tsx
export const dynamic = 'force-dynamic';

// ⚠️ Layout “transparente”: NÃO renderiza header/sidebar.
// O header + sidebar já vêm do src/app/(app)/layout.tsx.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
