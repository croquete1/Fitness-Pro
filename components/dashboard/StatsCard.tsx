// components/StatsCard.tsx
import React from 'react'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow">
      {icon && <div className="text-brand-500 mr-3">{icon}</div>}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
