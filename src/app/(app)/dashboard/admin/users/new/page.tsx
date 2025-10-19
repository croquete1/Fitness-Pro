import * as React from 'react';

import UserFormClient from '../UserFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  const initial = {
    name: '',
    email: '',
    role: 'client' as const,
    status: 'active' as const,
    approved: true,
    active: true,
  };

  return (
    <div className="admin-user-form-page">
      <UserFormClient mode="create" initial={initial} />
    </div>
  );
}

