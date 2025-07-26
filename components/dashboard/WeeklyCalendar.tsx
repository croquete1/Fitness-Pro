// components/WeeklyCalendar.tsx
import React from 'react'

interface WeeklyCalendarProps {
  week: { day: string; workout?: string }[]
}

export function WeeklyCalendar({ week }: WeeklyCalendarProps) {
  return (
    <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-lg shadow">
      {week.map(({ day, workout }) => (
        <div key={day} className="text-center">
          <p className="font-medium">{day}</p>
          <p className="text-sm text-gray-600">{workout || '-'}</p>
        </div>
      ))}
    </div>
  )
}
