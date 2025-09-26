// src/app/(app)/layout.tsx

import SidebarProvider from '@/components/layout/SidebarProvider'; // <--- CORRIGIDO

export default function Layout({ children }: { children: React.ReactNode }) {
    return <SidebarProvider>{children}</SidebarProvider>;
}