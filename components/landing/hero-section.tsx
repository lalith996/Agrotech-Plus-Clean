'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ParallaxContainer } from "@/components/motion/parallax-container"
import { Reveal } from "@/components/motion/reveal"
import { motion, useInView } from "framer-motion"
import { useRef, useMemo } from "react"

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })
  
  const floatingCardVariants = useMemo(() => ({
    animate: isInView ? { 
      y: [-10, 10, -10],
      rotate: [0, 1, -1, 0]
    } : { y: 0, rotate: 0 },
    transition: { 
      duration: 8, 
      repeat: isInView ? Infinity : 0, 
      ease: "easeInOut" 
    }
  }), [isInView])
  
  const floatingCard2Variants = useMemo(() => ({
    animate: isInView ? { 
      y: [10, -10, 10],
      rotate: [0, -1, 1, 0]
    } : { y: 0, rotate: 0 },
    transition: { 
      duration: 6, 
      repeat: isInView ? Infinity : 0, 
      ease: "easeInOut",
      delay: 2
    }
  }), [isInView])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParallaxContainer
        layers={[
          {
            strength: 0.1,
            children: (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-accent/20" />
            )
          },
          {
            strength: 0.3,
            children: (
              <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-32 h-32 bg-brand/10 rounded-full blur-xl" />
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/10 rounded-full blur-xl" />
              </div>
            )
          },
          {
            strength: 0.6,
            children: (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  {...floatingCardVariants}
                  className="absolute top-1/4 left-1/4"
                >
                  <Card className="glass-card w-48 h-32">
                    <CardContent className="p-4">
                      <div className="w-full h-full bg-gradient-to-br from-brand/20 to-transparent rounded" />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  {...floatingCard2Variants}
                  className="absolute top-1/3 right-1/4"
                >
                  <Card className="glass-card w-40 h-28">
                    <CardContent className="p-4">
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent rounded" />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )
          }
        ]}
        className="absolute inset-0"
      />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <Reveal variant="fadeUp">
          <h1 className="display-lg text-foreground mb-6 max-w-4xl mx-auto">
            From Soil to Home — Transparent Organic Supply
          </h1>
        </Reveal>
        
        <Reveal variant="fadeUp" delay={0.08}>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your organic produce from farm to table with complete transparency, 
            smart routing, and sustainable practices.
          </p>
        </Reveal>
        
        <Reveal variant="fadeUp" delay={0.16}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="gradient"
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3"
            >
              See How It Works
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}