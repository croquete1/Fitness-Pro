// src/components/dashboard/RecentActivityList.tsx
import React from 'react';

interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

interface RecentActivityListProps {
  activities: Activity[];
}

export default function RecentActivityList({
  activities,
}: RecentActivityListProps) {
  return (
    <ul className="space-y-2">
      {activities.map(act => (
        <li
          key={act.id}
          className="flex justify-between p-3 bg-white rounded shadow"
        >
          <span>{act.description}</span>
          <time className="text-xs text-gray-500">
            {new Date(act.timestamp).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
