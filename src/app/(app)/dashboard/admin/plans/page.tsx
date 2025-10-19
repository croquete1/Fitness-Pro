import PlansClient from './PlansClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <div className="admin-plans-page">
      <PlansClient />
    </div>
  );
}
