"use client"

import { SessionProvider } from "next-auth/react"
import { RoleBasedHeader } from "./role-based-header"
import { Footer } from "./footer"
import Chatbot from "../Chatbot"; // Corrected import path

interface MainLayoutProps {
  children: React.ReactNode
  session?: any
}

export function MainLayout({ children, session }: MainLayoutProps) {
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <RoleBasedHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Chatbot />
      </div>
    </SessionProvider>
  )
}
