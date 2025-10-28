'use client'

import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface PriceVarianceChartProps {
  data: Array<{ category: string; variance: number; avg: number; count: number }>
}

export function PriceVarianceChart({ data }: PriceVarianceChartProps) {
  const chartData = data.map(d => ({ category: d.category, variance: Number(d.variance.toFixed(2)), avg: Number(d.avg.toFixed(2)), count: d.count }))
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip formatter={(value: any, name: any) => [name === 'variance' ? `${value}` : `$${value}`, name]} />
          <Legend />
          <Bar dataKey="variance" name="Variance" fill="hsl(var(--brand))" />
          <Bar dataKey="avg" name="Avg Price" fill="hsl(var(--muted))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}