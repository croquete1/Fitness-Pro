// src/app/(app)/dashboard/admin/layout.tsx
import { SidebarProvider } from '@/components/layout/SidebarProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
