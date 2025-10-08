'use client'

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useUserStore } from "@/lib/stores/user-store"
import { Bars3CenterLeftIcon } from "@heroicons/react/24/solid"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useUserStore()
  const ref = useRef(null)
  const { scrollY } = useScroll()
  
  const headerHeight = useTransform(scrollY, [0, 100], [72, 56])
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 12])

  return (
    <motion.header
      ref={ref}
      style={{ 
        height: headerHeight,
        backdropFilter: `blur(${backdropBlur}px)`
      }}
      className="sticky top-0 z-40 border-b bg-background/80 px-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Bars3CenterLeftIcon className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-lg font-semibold">
            Welcome, {user?.name || 'User'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your next delivery: Jan 15, 2024
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-brand">
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
      </div>
    </motion.header>
  )
}