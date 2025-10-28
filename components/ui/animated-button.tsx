/**
 * Animated Button Component with GSAP Hover Effects
 * Includes magnetic effect, ripple, and scale animations
 */

'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  magnetic?: boolean
  ripple?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className,
  disabled = false,
  magnetic = true,
  ripple = true,
  type = 'button',
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  // Magnetic button effect
  useEffect(() => {
    if (!magnetic || disabled) return

    const button = buttonRef.current
    if (!button) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      const distance = Math.sqrt(x * x + y * y)

      if (distance < 150) {
        gsap.to(button, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.5,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [magnetic, disabled])

  // Hover scale effect
  useEffect(() => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(1.7)',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [disabled])

  // Ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || disabled) {
      onClick?.()
      return
    }

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)

    // Button press animation
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        })
      },
    })

    onClick?.()
  }

  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden'

  const variantStyles = {
    default: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus-visible:ring-green-600',
    ghost: 'text-green-600 hover:bg-green-50 focus-visible:ring-green-600',
    gradient: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus-visible:ring-green-600',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

/**
 * Pulsing Button - Attention-grabbing animation
 */
export function PulsingButton({
  children,
  ...props
}: Omit<AnimatedButtonProps, 'variant'>) {
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    gsap.to(button, {
      scale: 1.05,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  return (
    <div ref={buttonRef}>
      <AnimatedButton {...props} variant="gradient">
        {children}
      </AnimatedButton>
    </div>
  )
}

/**
 * Glowing Button - Continuous glow effect
 */
export function GlowingButton({
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <AnimatedButton
      {...props}
      className={cn(
        'shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70 transition-shadow duration-300',
        className
      )}
      variant="gradient"
    >
      {children}
    </AnimatedButton>
  )
}

/**
 * Shimmer Button - Shimmer animation effect
 */
export function ShimmerButton({
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <AnimatedButton
      {...props}
      className={cn(
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        className
      )}
      variant="gradient"
    >
      {children}
    </AnimatedButton>
  )
}
