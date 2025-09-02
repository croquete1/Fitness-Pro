// src/components/layout/SidebarAdmin.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { toAppRole, isAdmin } from '@/lib/roles';

// Ícones modernos (cores personalizáveis via props)
import type { LucideIcon } from 'lucide-react';
import { Home, Users, Dumbbell, ClipboardList } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  color: string;     // cor principal do ícone (hex, rgb, var())
  hidden?: boolean;  // para render condicional
};

export default function SidebarAdmin(props: { user?: { role?: unknown } | null }) {
  const role = toAppRole(props?.user?.role);

  // Conjunto base da navegação + item extra só para ADMIN (sem JSX solto)
  const items: NavItem[] = [
    { label: 'Início', href: '/dashboard', Icon: Home, color: '#2563eb' },              // azul
    { label: 'Clientes & Pacotes', href: '/dashboard/admin/clients', Icon: Users, color: '#059669' }, // verde
    { label: 'Planos de treino (PT)', href: '/dashboard/pt/plans', Icon: Dumbbell, color: '#a855f7' }, // roxo
    { label: 'Planos (Admin)', href: '/dashboard/admin/plans', Icon: ClipboardList, color: '#f59e0b', hidden: !isAdmin(role) }, // âmbar
  ].filter(i => !i.hidden);

  return (
    <nav aria-label="Admin" className="sidebar">
      <ul className="sidebar-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map(({ href, label, Icon, color }) => (
          <li key={href}>
            <Link
              href={href}
              className="nav-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              {/* Badge do ícone com fundo translúcido da mesma cor */}
              <span
                aria-hidden
                className="icon-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: withAlpha(color, 0.12), // ~12% alpha
                  transition: 'transform 120ms ease',
                }}
              >
                <Icon size={18} strokeWidth={2} color={color} />
              </span>

              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* hover suave sem styled-components nem libs extra */}
      <style>{`
        .nav-link:hover .icon-badge { transform: translateY(-1px); }
      `}</style>
    </nav>
  );
}

/**
 * Converte HEX ou rgb/var() para uma cor com alpha aplicado.
 * - Se for hex (#RRGGBB), converte para rgba(r,g,b,a)
 * - Caso contrário, devolve a própria cor (sem alpha) — continua a funcionar
 */
function withAlpha(color: string, alpha = 0.12): string {
  // #RRGGBB
  const hex = color?.trim();
  const hexMatch = /^#?([A-Fa-f0-9]{6})$/.exec(hex);
  if (hexMatch) {
    const intVal = parseInt(hexMatch[1], 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // para rgb(), hsl(), var(--color) etc., devolve como está (sem alpha)
  return color;
}