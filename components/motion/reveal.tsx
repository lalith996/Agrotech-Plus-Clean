'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface RevealProps {
  children: React.ReactNode
  variant?: 'fadeUp' | 'slideInX'
  delay?: number
  className?: string
}

const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  },
  slideInX: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
  }
}

export function Reveal({ children, variant = 'fadeUp', delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const selectedVariant = variants[variant]

  return (
    <motion.div
      ref={ref}
      initial={selectedVariant.initial}
      animate={isInView ? selectedVariant.animate : selectedVariant.initial}
      transition={{ ...selectedVariant.transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}