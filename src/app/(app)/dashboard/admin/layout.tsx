// src/app/(app)/dashboard/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Importante: NÃO renderizar sidebar/header aqui.
  return <>{children}</>;
}
