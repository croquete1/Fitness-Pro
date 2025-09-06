// server wrapper — opções de segmento ficam aqui
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import NotificationsClient from './NotificationsClient';

export default function NotificationsPage() {
  return <NotificationsClient />;
}
