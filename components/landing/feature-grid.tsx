import React from 'react'
import { Rocket, Truck, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FeatureItem {
  title: string
  description: string
  icon: React.ReactNode
}

const features: FeatureItem[] = [
  {
    title: 'Rapid Growth',
    description: 'Accelerate your agri-business with data-driven insights and AI-powered recommendations to maximize yield and efficiency.',
    icon: <Rocket aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: 'Efficient Logistics',
    description: 'Streamline operations with real-time tracking, optimized routes, and intelligent resource allocation.',
    icon: <Truck aria-hidden="true" className="h-6 w-6" />
  },
  {
    title: 'Actionable Analytics',
    description: 'Visualize performance with customizable dashboards and reports using advanced analytics.',
    icon: <BarChart3 aria-hidden="true" className="h-6 w-6" />
  }
]

export function FeatureGrid({ className }: { className?: string }) {
  return (
    <section
      className={cn('grid grid-cols-1 gap-6 md:grid-cols-3', className)}
      aria-label="Key product features"
    >
      {features.map((feature, idx) => (
        <Card key={idx}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50"
                aria-hidden="true"
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold leading-6 text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}