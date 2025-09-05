// src/app/(app)/dashboard/pt/layout.tsx
export const dynamic = 'force-dynamic';

// ⚠️ Transparent wrapper (sem header/sidebar)
export default function PTLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
