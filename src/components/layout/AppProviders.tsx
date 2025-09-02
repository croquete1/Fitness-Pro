'use client';
import SidebarProvider from './SidebarProvider'; // default agora existe
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}