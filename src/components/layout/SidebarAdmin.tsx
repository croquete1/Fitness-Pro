// src/components/layout/SidebarAdmin.tsx
import Link from 'next/link';
import { Dumbbell, Users, LayoutDashboard, Package, Library } from 'lucide-react';

export default function SidebarAdmin() {
  const items = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> , color: '#0ea5e9' },
    { label: 'Utilizadores', href: '/dashboard/admin/users', icon: <Users size={18} /> , color: '#a78bfa' },
    { label: 'Clientes & Pacotes', href: '/dashboard/admin/clients', icon: <Package size={18} /> , color: '#22c55e' },
    { label: 'Planos (Admin)', href: '/dashboard/admin/plans', icon: <Library size={18} /> , color: '#f59e0b' },
    // novo catálogo de exercícios
    { label: 'Exercícios (Catálogo)', href: '/dashboard/admin/exercises', icon: <Dumbbell size={18} /> , color: '#ef4444' },
  ];

  return (
    <nav aria-label="Admin">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="nav-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 8,
                display: 'grid', placeItems: 'center',
                background: `${it.color}22`, color: it.color, border: `1px solid ${it.color}33`
              }}>
                {it.icon}
              </span>
              <span>{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}