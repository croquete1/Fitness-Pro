import * as React from 'react';

import PlanFormClient from '../PlanFormClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="admin-plan-form-page">
      <PlanFormClient mode="create" />
    </div>
  );
}
