'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface ParallaxLayer {
  strength: number
  children: React.ReactNode
}

interface ParallaxContainerProps {
  layers: ParallaxLayer[]
  className?: string
}

function ParallaxLayer({ layer, scrollYProgress, index }: { layer: ParallaxLayer; scrollYProgress: any; index: number }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, layer.strength * -100])
  
  return (
    <motion.div
      key={index}
      style={{ y }}
      className="absolute inset-0"
    >
      {layer.children}
    </motion.div>
  )
}

export function ParallaxContainer({ layers, className }: ParallaxContainerProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  return (
    <div ref={ref} className={`relative ${className}`}>
      {layers.map((layer, index) => (
        <ParallaxLayer 
          key={index}
          layer={layer} 
          scrollYProgress={scrollYProgress} 
          index={index} 
        />
      ))}
    </div>
  )
}