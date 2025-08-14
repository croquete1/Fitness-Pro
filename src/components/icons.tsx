// src/components/icons.tsx
"use client";

import {
  Home,
  CalendarDays,
  MessageSquare,
  Settings,
  CreditCard,
  Dumbbell,
  Users,
  ClipboardList,
  Library,
  Shield,
  UserPlus,
  GitBranch,
  ClipboardCheck,
  BarChart3,
  Server,
  FileClock,
  LayoutDashboard,
} from "lucide-react";

export const icons = {
  home: Home,
  dashboard: LayoutDashboard,
  sessions: CalendarDays,
  messages: MessageSquare,
  profile: Settings,
  billing: CreditCard,

  // PT
  trainer: Dumbbell,
  trainerClients: Users,
  trainerPlans: ClipboardList,
  trainerLibrary: Library,

  // Admin
  admin: Shield,
  approvals: UserPlus,
  users: Users,
  roster: GitBranch,
  exercises: Dumbbell,
  planTemplates: ClipboardCheck,
  reports: BarChart3,
  system: Server,
  logs: FileClock,
} as const;

export type IconName = keyof typeof icons;

export function AppIcon({ name, className }: { name: IconName; className?: string }) {
  const Cmp = icons[name];
  return <Cmp className={className} />;
}
