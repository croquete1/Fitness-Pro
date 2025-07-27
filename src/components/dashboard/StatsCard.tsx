// src/components/dashboard/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  colorClass?: string; // ex: "bg-blue-500"
}

export default function StatsCard({
  title,
  value,
  icon,
  colorClass = 'bg-gray-200',
}: StatsCardProps) {
  return (
    <div className={`p-4 rounded shadow ${colorClass} flex items-center`}>
      {icon && <div className="mr-3">{icon}</div>}
      <div>
        <p className="text-sm text-gray-700">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
