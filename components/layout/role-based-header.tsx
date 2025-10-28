/**
 * RoleBasedHeader Component
 * 
 * A header component that adapts its navigation and display based on the user's role.
 * Features:
 * - Role-filtered navigation items
 * - User email display with parsed components (city, name, number)
 * - Role badge with color coding
 * - Active route highlighting
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { roleAccessControl, NavigationItem } from "@/lib/role-access-control"
import { getRoleConfig, getRoleBadgeClasses } from "@/lib/config/roles"
import { emailGenerator } from "@/lib/email-generator"
import { UserRole } from "@prisma/client"
import { 
  Menu, 
  X, 
  User,
  Leaf,
  LogOut,
  Settings,
  Home,
  ShoppingBag,
  Package,
  RefreshCcw,
  Heart,
  LayoutDashboard,
  Truck,
  BarChart3,
  Award,
  Users,
  UserCog,
  ClipboardList,
  MapPin,
  CheckCircle,
  TrendingUp,
  Map,
  DollarSign
} from "lucide-react"

// Icon mapping for navigation items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  ShoppingBag,
  Package,
  RefreshCcw,
  Heart,
  User,
  LayoutDashboard,
  Truck,
  BarChart3,
  Award,
  Users,
  UserCog,
  ClipboardList,
  MapPin,
  CheckCircle,
  TrendingUp,
  Settings,
  Map,
  DollarSign
}

export function RoleBasedHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get navigation items for current user role
  const navigationItems = session?.user?.role 
    ? roleAccessControl.getNavigationItems(session.user.role as UserRole)
    : []

  // Parse user email to extract components (only for generated emails)
  const parsedEmail = session?.user?.email && session?.user?.role !== 'CUSTOMER'
    ? emailGenerator.parseEmail(session.user.email)
    : null

  // Get role configuration
  const roleConfig = session?.user?.role 
    ? getRoleConfig(session.user.role as UserRole)
    : null

  // Get role badge classes
  const roleBadgeClasses = session?.user?.role
    ? getRoleBadgeClasses(session.user.role as UserRole)
    : null

  // Check if route is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  // Get icon component
  const getIcon = (iconName: string) => {
    return iconMap[iconName] || User
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#00B207] text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="hidden md:block">🌱 Fresh Organic Produce Delivered to Your Door</span>
            <span className="md:hidden">🌱 Fresh & Organic</span>
          </div>
          {session?.user?.role && roleConfig && (
            <div className="flex items-center space-x-2">
              <Badge 
                className={`${roleBadgeClasses?.bg} ${roleBadgeClasses?.text} border ${roleBadgeClasses?.border} text-xs`}
              >
                {roleConfig.displayName}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className={`bg-white border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00B207] to-green-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">AgroTrack+</span>
                <span className="text-xs text-[#00B207] hidden sm:block">100% Organic</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = getIcon(item.icon)
                const isActive = isActiveRoute(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors font-medium ${
                      isActive
                        ? 'text-[#00B207] bg-green-50'
                        : 'text-gray-700 hover:text-[#00B207] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button aria-label="User menu" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-[#00B207] transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback className="bg-[#00B207] text-white">
                          {parsedEmail?.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-xl" align="end" forceMount>
                    <div className="flex flex-col space-y-2 p-3">
                      {/* User Info */}
                      <div className="flex flex-col space-y-1">
                        {/* For customers: show name and real email */}
                        {session.user.role === 'CUSTOMER' && (
                          <>
                            <p className="font-medium text-sm">
                              {session.user.name}
                            </p>
                            {session.user.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {session.user.email}
                              </p>
                            )}
                          </>
                        )}
                        
                        {/* For other roles: show parsed email components */}
                        {session.user.role !== 'CUSTOMER' && parsedEmail && (
                          <>
                            <p className="font-medium text-sm capitalize">
                              {parsedEmail.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {parsedEmail.city.toUpperCase()} • #{parsedEmail.registrationNumber}
                            </p>
                            {session.user.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {session.user.email}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Role Badge */}
                      {roleConfig && roleBadgeClasses && (
                        <Badge 
                          className={`${roleBadgeClasses.bg} ${roleBadgeClasses.text} border ${roleBadgeClasses.border} w-fit`}
                        >
                          {roleConfig.displayName}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onSelect={(event) => {
                        event.preventDefault()
                        signOut()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild className="rounded-full">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-full bg-[#00B207] hover:bg-green-700">
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile User Icon */}
              {!session && (
                <Link href="/auth/signin" className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <User className="w-6 h-6 text-gray-700" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00B207] to-green-600 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">AgroTrack+</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = getIcon(item.icon)
                const isActive = isActiveRoute(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      isActive
                        ? 'text-[#00B207] bg-green-50'
                        : 'text-gray-700 hover:text-[#00B207] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile User Section */}
            {session ? (
              <div className="border-t p-4 mt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="bg-[#00B207] text-white">
                      {parsedEmail?.name?.charAt(0).toUpperCase() || session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {/* For customers: show name and real email */}
                    {session.user.role === 'CUSTOMER' && (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.name}
                        </p>
                        {session.user.email && (
                          <p className="text-xs text-gray-500 truncate">
                            {session.user.email}
                          </p>
                        )}
                      </>
                    )}
                    
                    {/* For other roles: show parsed email components */}
                    {session.user.role !== 'CUSTOMER' && parsedEmail && (
                      <>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {parsedEmail.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {parsedEmail.city.toUpperCase()} • #{parsedEmail.registrationNumber}
                        </p>
                      </>
                    )}
                    
                    {roleConfig && roleBadgeClasses && (
                      <Badge 
                        className={`${roleBadgeClasses.bg} ${roleBadgeClasses.text} border ${roleBadgeClasses.border} text-xs mt-1`}
                      >
                        {roleConfig.displayName}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t p-4 mt-4 space-y-2">
                <Button asChild className="w-full rounded-full bg-[#00B207] hover:bg-green-700">
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
