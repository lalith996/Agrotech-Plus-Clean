'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/motion/reveal"
import { motion } from "framer-motion"
import { RocketLaunchIcon, TruckIcon, ChartBarIcon } from "@heroicons/react/24/solid"

const features = [
  {
    id: 'traceability',
    icon: RocketLaunchIcon,
    title: "Traceability",
    description: "Scan & verify journey"
  },
  {
    id: 'smart-routing',
    icon: TruckIcon,
    title: "Smart Routing",
    description: "On-time perishables"
  },
  {
    id: 'forecasting',
    icon: ChartBarIcon,
    title: "Forecasting",
    description: "Balance demand & supply"
  }
]

export function FeatureGrid() {
  return (
    <section className="py-20 container mx-auto px-4" aria-labelledby="features-heading">
      <div className="sr-only">
        <h2 id="features-heading">AgroTrack+ Features</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
        {features.map((feature, index) => (
          <Reveal key={feature.id} variant="fadeUp" delay={index * 0.1}>
            <motion.div
              whileHover={{ 
                y: -8,
                rotateX: 2,
                rotateY: 2,
              }}
              transition={{ duration: 0.22 }}
              className="h-full"
              role="listitem"
            >
              <Card className="glass-card h-full hover:shadow-glow transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2" tabIndex={0} role="article" aria-labelledby={`feature-${feature.id}`}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-brand/10">
                    <feature.icon className="w-8 h-8 text-brand" />
                  </div>
                  <CardTitle className="text-xl" id={`feature-${feature.id}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}