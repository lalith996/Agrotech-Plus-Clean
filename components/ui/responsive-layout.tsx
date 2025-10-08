import React from 'react'
import { cn } from '@/lib/utils'

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  }

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const gridCols = []
  if (cols.default) gridCols.push(`grid-cols-${cols.default}`)
  if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`)

  return (
    <div className={cn(
      'grid',
      ...gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile-first navigation component
interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileNavigation({ isOpen, onClose, children }: MobileNavigationProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Navigation panel */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {children}
        </div>
      </div>
    </>
  )
}

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function ResponsiveCard({ 
  children, 
  className, 
  padding = 'md',
  hover = false 
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 shadow-sm',
      paddingClasses[padding],
      hover && 'hover:shadow-md transition-shadow duration-200',
      className
    )}>
      {children}
    </div>
  )
}

// Responsive table component
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className={cn('min-w-full divide-y divide-gray-200', className)}>
            {children}
          </table>
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized form layout
interface MobileFormProps {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

export function MobileForm({ children, className, spacing = 'md' }: MobileFormProps) {
  const spacingClasses = {
    sm: 'space-y-3',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  }

  return (
    <form className={cn(
      'w-full',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </form>
  )
}

// Responsive button group
interface ResponsiveButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical' | 'responsive'
  spacing?: 'sm' | 'md' | 'lg'
}

export function ResponsiveButtonGroup({ 
  children, 
  className,
  orientation = 'responsive',
  spacing = 'md'
}: ResponsiveButtonGroupProps) {
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  }

  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
    responsive: 'flex flex-col sm:flex-row'
  }

  return (
    <div className={cn(
      orientationClasses[orientation],
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive image component
interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall'
  objectFit?: 'cover' | 'contain' | 'fill'
}

export function ResponsiveImage({ 
  src, 
  alt, 
  className,
  aspectRatio = 'video',
  objectFit = 'cover'
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    tall: 'aspect-[3/4]'
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full',
          objectFitClasses[objectFit]
        )}
        loading="lazy"
      />
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
  responsive?: boolean
}

export function ResponsiveText({ 
  children, 
  className,
  size = 'base',
  weight = 'normal',
  color = 'default',
  responsive = false
}: ResponsiveTextProps) {
  const sizeClasses = responsive ? {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl'
  } : {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const colorClasses = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    accent: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }

  return (
    <span className={cn(
      sizeClasses[size],
      weightClasses[weight],
      colorClasses[color],
      className
    )}>
      {children}
    </span>
  )
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  direction?: 'vertical' | 'horizontal' | 'both'
}

export function ResponsiveSpacing({ size = 'md', direction = 'vertical' }: ResponsiveSpacingProps) {
  const spacingClasses = {
    xs: 'h-2 w-2 sm:h-3 sm:w-3',
    sm: 'h-3 w-3 sm:h-4 sm:w-4',
    md: 'h-4 w-4 sm:h-6 sm:w-6',
    lg: 'h-6 w-6 sm:h-8 sm:w-8',
    xl: 'h-8 w-8 sm:h-12 sm:w-12',
    '2xl': 'h-12 w-12 sm:h-16 sm:w-16'
  }

  const directionClasses = {
    vertical: 'w-full',
    horizontal: 'h-full',
    both: ''
  }

  return (
    <div className={cn(
      spacingClasses[size],
      directionClasses[direction]
    )} />
  )
}

// Hook for responsive breakpoints
export function useResponsive() {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('xs')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else if (width >= 640) setBreakpoint('sm')
      else setBreakpoint('xs')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'xs',
    isTablet: breakpoint === 'sm' || breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
    isSmallScreen: breakpoint === 'xs' || breakpoint === 'sm'
  }
}

// Touch-friendly component wrapper
interface TouchFriendlyProps {
  children: React.ReactNode
  className?: string
  minTouchTarget?: boolean
}

export function TouchFriendly({ children, className, minTouchTarget = true }: TouchFriendlyProps) {
  return (
    <div className={cn(
      minTouchTarget && 'min-h-[44px] min-w-[44px] flex items-center justify-center',
      'touch-manipulation select-none',
      className
    )}>
      {children}
    </div>
  )
}

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  MobileNavigation,
  ResponsiveCard,
  ResponsiveTable,
  MobileForm,
  ResponsiveButtonGroup,
  ResponsiveImage,
  ResponsiveText,
  ResponsiveSpacing,
  useResponsive,
  TouchFriendly
}