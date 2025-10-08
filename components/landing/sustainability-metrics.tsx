'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { Reveal } from "@/components/motion/reveal"
import { mockQuery } from "@/lib/agrotrackMockData"

export function SustainabilityMetrics() {
  const metrics = [
    {
      title: "Food Miles Reduced",
      value: mockQuery.consumerDashboard.sustainabilityMetrics.foodMilesReduced,
      format: (n: number) => `${n}%`,
      color: "text-success"
    },
    {
      title: "Carbon Saved",
      value: mockQuery.consumerDashboard.sustainabilityMetrics.carbonSaved,
      format: (n: number) => `${n} lbs`,
      color: "text-brand"
    },
    {
      title: "Packaging Recycled",
      value: mockQuery.consumerDashboard.sustainabilityMetrics.packagingRecycled,
      format: (n: number) => `${n}%`,
      color: "text-accent"
    }
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <Reveal variant="fadeUp">
          <h2 className="display-md text-center mb-12">
            Sustainability Impact
          </h2>
        </Reveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <Reveal key={metric.title} variant="fadeUp" delay={index * 0.1}>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${metric.color} mb-2`}>
                    <AnimatedNumber 
                      value={metric.value} 
                      format={metric.format}
                      duration={1.2}
                    />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}