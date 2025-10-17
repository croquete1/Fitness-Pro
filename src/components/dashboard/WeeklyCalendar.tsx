// components/WeeklyCalendar.tsx
import React from 'react'

interface WeeklyCalendarProps {
  week: { day: string; workout?: string }[]
}

export function WeeklyCalendar({ week }: WeeklyCalendarProps) {
  return (
    <div
      className="card"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 8,
        padding: 16,
      }}
    >
      {week.map(({ day, workout }) => (
        <div key={day} className="text-center">
          <p className="font-medium">{day}</p>
          <p className="text-sm text-muted">{workout || '-'}</p>
        </div>
      ))}
    </div>
  )
}
