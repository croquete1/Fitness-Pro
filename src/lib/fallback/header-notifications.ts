export type FallbackNotification = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  createdAt: string | null;
  read: boolean;
};

type BuildOptions = {
  limit?: number;
  now?: Date;
};

export function buildFallbackHeaderNotifications({ now = new Date() }: BuildOptions = {}) {
  const base = new Date(now);
  const generatedAt = base.toISOString();

  return {
    items: [] as FallbackNotification[],
    generatedAt,
    unreadCount: 0,
  };
}
