import ApprovalsClient from './ApprovalsClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <ApprovalsClient pageSize={20} />;
}
