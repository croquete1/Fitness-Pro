// src/components/layout/SidebarAdmin.tsx
'use client';
import SidebarBase, { NavGroup } from './SidebarBase';

const I = {
  Dashboard: <SidebarBase.__proto__.constructor.Icon?.Dashboard /> // (truque não funciona)
};
// -> Usamos o mesmo set do SidebarBase:
import React from 'react';
const Icon = (SidebarBase as any).__proto__?.Icon ?? {}; // ignore

export default function SidebarAdmin() {
  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/></svg> },
        { href: '/dashboard/reports', label: 'Relatórios', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h14l4 4v12a2 2 0 0 1-2 2H3z"/><path d="M17 4v6h6"/><path d="M8 13h8M8 17h5"/></svg> },
        { href: '/dashboard/settings', label: 'Definições', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1v.2a2 2 0 1 1-4 0v-.2a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H3a2 2 0 1 1 0-4h.2a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.24 3.6l.06.06A1.65 1.65 0 0 0 9 4.6c.37 0 .72-.14 1-.4a1.65 1.65 0 0 0 .4-1V3a2 2 0 1 1 4 0v.2a1.65 1.65 0 0 0 .4 1c.28.26.63.4 1 .4.62 0 1.21-.25 1.58-.64l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.26.28-.4.63-.4 1 0 .37.14.72.4 1 .26.28.61.46 1 .6H21a2 2 0 1 1 0 4h-.2c-.37 0-.72.14-1 .4-.26.28-.46.63-.6 1Z"/></svg> },
      ],
    },
    {
      title: 'Admin',
      items: [
        { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/><path d="M21 12a9 9 0 1 1-9-9"/></svg> },
        { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { href: '/dashboard/admin/system-health', label: 'Saúde do sistema', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h3l2 5 4-14 2 9h3"/></svg> },
      ],
    },
    {
      title: 'Faturação',
      items: [{ href: '/dashboard/billing', label: 'Faturação', icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h3"/></svg> }],
    },
  ];

  return (
    <SidebarBase brand={{ name: 'Fitness Pro', sub: 'Dashboard', href: '/dashboard', logoSrc: '/logo.svg' }} groups={groups} />
  );
}
