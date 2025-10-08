"use client"

import { FarmerSidebar } from "./farmer-sidebar"

interface FarmerLayoutProps {
  children: React.ReactNode
}

export function FarmerLayout({ children }: FarmerLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <FarmerSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
