// src/app/(app)/dashboard/layout.tsx
import { SidebarProvider } from '@/components/layout/SidebarProvider';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
