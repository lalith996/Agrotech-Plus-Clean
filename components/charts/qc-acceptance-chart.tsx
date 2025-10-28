'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

interface QCAcceptanceChartProps {
  data: Array<{ week: string; rate: number }>
}

export function QCAcceptanceChart({ data }: QCAcceptanceChartProps) {
  const chartData = data.map(d => ({ week: d.week, rate: Number(d.rate.toFixed(1)) }))
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip formatter={(v: any) => [`${v}%`, 'Acceptance']} />
          <Line type="monotone" dataKey="rate" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}