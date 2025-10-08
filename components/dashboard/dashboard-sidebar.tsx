'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore } from "@/lib/stores/user-store"
import { UserRole } from "@/lib/types"
import { 
  RocketLaunchIcon, 
  TruckIcon, 
  ChartBarIcon,
  QrCodeIcon,
  Bars3CenterLeftIcon
} from "@heroicons/react/24/solid"

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = {
  [UserRole.CONSUMER]: [
    { icon: RocketLaunchIcon, label: "Dashboard", href: "/dashboard" },
    { icon: TruckIcon, label: "Orders", href: "/orders" },
    { icon: QrCodeIcon, label: "Track", href: "/track" }
  ],
  [UserRole.FARMER]: [
    { icon: RocketLaunchIcon, label: "Dashboard", href: "/farmer" },
    { icon: ChartBarIcon, label: "Lots", href: "/farmer/lots" },
    { icon: TruckIcon, label: "Packages", href: "/farmer/packages" }
  ],
  [UserRole.OPERATIONS]: [
    { icon: RocketLaunchIcon, label: "Dashboard", href: "/ops" },
    { icon: TruckIcon, label: "Routes", href: "/ops/routes" },
    { icon: ChartBarIcon, label: "Analytics", href: "/ops/analytics" }
  ],
  [UserRole.DRIVER]: [
    { icon: RocketLaunchIcon, label: "Dashboard", href: "/driver" },
    { icon: TruckIcon, label: "Deliveries", href: "/driver/deliveries" }
  ],
  [UserRole.ADMIN]: [
    { icon: RocketLaunchIcon, label: "Dashboard", href: "/admin" },
    { icon: ChartBarIcon, label: "Reports", href: "/admin/reports" },
    { icon: TruckIcon, label: "Users", href: "/admin/users" }
  ]
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const { user } = useUserStore()
  const items = user ? menuItems[user.role] || [] : []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ 
              type: "spring", 
              stiffness: 280, 
              damping: 32 
            }}
            className="fixed left-0 top-0 z-50 h-full w-70 bg-card border-r lg:relative lg:translate-x-0"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-brand">AgroTrack+</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <Bars3CenterLeftIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="space-y-2">
                {items.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}