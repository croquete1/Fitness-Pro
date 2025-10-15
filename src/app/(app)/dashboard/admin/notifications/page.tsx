import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <NotificationsClient pageSize={20} />;
}
