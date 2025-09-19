export const dynamic = 'force-dynamic';

import NotificationsListClient from '@/components/notifications/NotificationsListClient';

export default function NotificationsPage() {
  // carrega tudo no cliente (paginação/aba manipuladas no client)
  return <NotificationsListClient />;
}
