'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { Reveal } from "@/components/motion/reveal"
import { OrdersChart } from "@/components/charts/orders-chart"
import { mockQuery } from "@/lib/agrotrackMockData"
import { formatDate } from "@/lib/utils"

export function ConsumerDashboard() {
  const { consumerDashboard } = mockQuery

  if (!consumerDashboard) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Reveal variant="fadeUp">
          <Card className="glass-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Active Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brand">
                    {consumerDashboard.activeSubscription?.plan || 'No active plan'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Next delivery: {consumerDashboard.activeSubscription?.nextDelivery 
                      ? formatDate(consumerDashboard.activeSubscription.nextDelivery)
                      : 'Not scheduled'
                    }
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal variant="fadeUp" delay={0.1}>
          <Card className="glass-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Food Miles Reduced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-success">
                  <AnimatedNumber 
                    value={consumerDashboard.sustainabilityMetrics?.foodMilesReduced || 0}
                    format={(n) => `${n}%`}
                  />
                </div>
                <Progress value={consumerDashboard.sustainabilityMetrics?.foodMilesReduced || 0} />
                <p className="text-sm text-muted-foreground">
                  Compared to conventional supply chains
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal variant="fadeUp" delay={0.2}>
          <Card className="glass-card hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-brand">
                  <AnimatedNumber 
                    value={consumerDashboard.sustainabilityMetrics?.carbonSaved || 0}
                    format={(n) => `${n} lbs`}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  CO₂ saved this month
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal variant="fadeUp" delay={0.3}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Orders Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersChart data={consumerDashboard.ordersTimeline || []} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}