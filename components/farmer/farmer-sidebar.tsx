"use client"

import Link from "next/link"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  TrendingUp,
  Truck,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/farmer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/farmer/products",
    icon: Package,
  },
  {
    name: "Deliveries",
    href: "/farmer/deliveries",
    icon: Truck,
  },
  {
    name: "Insights",
    href: "/farmer/insights",
    icon: TrendingUp,
  },
  {
    name: "Profile",
    href: "/farmer/profile",
    icon: User,
  },
]

export function FarmerSidebar() {
  const router = useRouter()

  return (
    <aside className="hidden lg:block w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Farmer Portal</h2>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-green-50 text-[#00B207] font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#00B207]"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
