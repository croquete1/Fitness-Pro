"use client";

import {
  LayoutDashboard,
  CalendarClock,
  RefreshCw,
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
  CheckCircle2,
  Terminal,
  History,
  PlusCircle,
  CalendarPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  sessions: CalendarClock,
  calendar: CalendarClock,
  messages: MessageSquare,
  users: Users,
  admins: Shield,
  shield: Shield,
  settings: Settings,
  exercises: Dumbbell,
  reports: ClipboardList,
  library: Library,
  dumbbell: Dumbbell,
  metrics: BarChart3,
  profile: UserCog,
  plans: FolderKanban,
  notifications: BellDot,
  tools: Wrench,
  system: Hammer,
  terminal: Terminal,
  "check-circle": CheckCircle2,
  history: History,
  'plus-circle': PlusCircle,
  'calendar-plus': CalendarPlus,
  wallet: Wallet,
  refresh: RefreshCw,
  logout: LogOut,
  menu: Menu,
};

export function NavIcon({
  name,
  size = 18,
  color,
  className,
}: {
  name?: string;
  size?: number | string;
  color?: string;
  className?: string;
}) {
  const C = name ? map[name] : undefined;
  if (!C) return <span style={{ fontSize: Number(size) || 16 }}>•</span>;
  return <C size={size} color={color} className={className} strokeWidth={1.8} />;
}
