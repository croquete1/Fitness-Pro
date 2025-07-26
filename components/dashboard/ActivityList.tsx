// components/ActivityList.tsx
import React from 'react'

interface Activity {
  date: string
  exercise: string
  reps: number
}

interface ActivityListProps {
  items: Activity[]
}

export function ActivityList({ items }: ActivityListProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-3">Histórico de Atividades</h3>
      <ul className="divide-y divide-gray-200">
        {items.map((act, idx) => (
          <li key={idx} className="py-2 flex justify-between">
            <span>{act.exercise}</span>
            <span className="text-sm text-gray-500">{act.date}</span>
            <span className="text-sm">{act.reps} reps</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
