'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

interface OrdersChartProps {
  data: Array<{
    date: Date
    orders: number
  }>
}

export function OrdersChart({ data }: OrdersChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(item.date, 'MMM dd')
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-elevated)'
            }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="hsl(var(--brand))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#orderGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}