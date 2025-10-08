import * as React from 'react';
import UsersClient from './users.client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <UsersClient pageSize={20} />;
}
