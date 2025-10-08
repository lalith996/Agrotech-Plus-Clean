'use client'

import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/lib/stores/theme-store"
import { motion } from "framer-motion"
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden"
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <SunIcon className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <MoonIcon className="h-5 w-5" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}