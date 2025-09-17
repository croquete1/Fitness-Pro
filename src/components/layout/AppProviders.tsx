'use client';
import { SidebarProvider } from './SidebarCtx';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
