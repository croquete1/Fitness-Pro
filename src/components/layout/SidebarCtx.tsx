'use client';

// Reexporta o tipo e o hook do provider novo.
// Assim, imports antigos de './SidebarCtx' continuam válidos.

export type { SidebarCtx } from './SidebarProvider';
export { useSidebar } from './SidebarProvider';
export { default as SidebarProvider } from './SidebarProvider';
