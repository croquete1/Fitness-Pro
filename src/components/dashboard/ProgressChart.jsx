// components/ProgressChart.tsx
import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ProgressChartProps {
  data: { date: string; value: number }[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
