'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedNumberProps {
  value: number
  format?: (value: number) => string
  duration?: number
  className?: string
}

export function AnimatedNumber({ 
  value, 
  format = (n) => n.toString(), 
  duration = 0.8,
  className 
}: AnimatedNumberProps) {
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => format(Math.round(current)))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span className={className} aria-live="polite">
      {display}
    </motion.span>
  )
}