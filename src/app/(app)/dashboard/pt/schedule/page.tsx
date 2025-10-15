'use client';

import TrainerScheduleClient from './TrainerScheduleClient';

export default function Page() {
  return (
    <div className="px-4 py-6 md:px-8">
      <TrainerScheduleClient pageSize={20} />
    </div>
  );
}
