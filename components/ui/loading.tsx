import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loading({ size = 'md', className }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-label="Loading">
      <motion.div
        className={cn("border-2 border-brand/20 border-t-brand rounded-full", sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}