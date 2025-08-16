// src/components/layout/icons.tsx
"use client";

import React from "react";
import {
  LayoutDashboard,
  CalendarClock,
  MessageSquare,
  Users,
  Shield,
  Settings,
  Dumbbell,
  ClipboardList,
  Library,
  BarChart3,
  UserCog,
  FolderKanban,
  BellDot,
  Wrench,
  Hammer,
  LogOut,
  Menu,
  type LucideIcon, // <- tipo correto dos ícones
} from "lucide-react";

// Mapa de ícones (usa o tipo LucideIcon para evitar erros de typing)
const map: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  sessions: CalendarClock,
  messages: MessageSquare,
  users: Users,
  admins: Shield,
  settings: Settings,
  exercises: Dumbbell,
  reports: ClipboardList,
  library: Library,
  metrics: BarChart3,
  profile: UserCog,
  plans: FolderKanban,
  notifications: BellDot,
  tools: Wrench,
  system: Hammer,
  logout: LogOut,
  menu: Menu,
};

export function NavIcon({
  name,
  size = 16,
  className,
}: {
  name?: string;
  size?: number | string;
  className?: string;
}) {
  const C = name ? map[name] : undefined;
  if (!C) {
    return <span style={{ fontSize: Number(size) || 16 }}>•</span>;
  }
  return <C size={size} className={className} />;
}
