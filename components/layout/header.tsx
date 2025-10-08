"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/stores/cart-store"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { UserRole } from "@prisma/client"
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  Heart, 
  User,
  Leaf,
  ChevronDown,
  Globe,
  HelpCircle,
  Package,
  LogOut,
  Settings
} from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [showShopDropdown, setShowShopDropdown] = useState(false)
  const [showPagesDropdown, setShowPagesDropdown] = useState(false)
  
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const wishlistItemCount = useWishlistStore((state) => state.getItemCount())

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getDashboardLink = (role: UserRole) => {
    switch (role) {
      case UserRole.CUSTOMER:
        return "/dashboard"
      case UserRole.FARMER:
        return "/farmer/dashboard"
      case UserRole.ADMIN:
      case UserRole.OPERATIONS:
        return "/admin/dashboard"
      default:
        return "/dashboard"
    }
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
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:opacity-80 transition-opacity">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Eng</span>
            </button>
            <Link href="/help" className="flex items-center space-x-1 hover:opacity-80 transition-opacity">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </Link>
          </div>
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
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-[#00B207] transition-colors font-medium"
              >
                Home
              </Link>
              
              {/* Shop Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowShopDropdown(true)}
                onMouseLeave={() => setShowShopDropdown(false)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-[#00B207] transition-colors font-medium">
                  <span>Shop</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showShopDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <Link href="/products" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      All Products
                    </Link>
                    <Link href="/products?category=vegetables" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      Vegetables
                    </Link>
                    <Link href="/products?category=fruits" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      Fruits
                    </Link>
                    <Link href="/products?category=dairy" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      Dairy
                    </Link>
                    <Link href="/products?organic=true" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      Organic
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                href="/farmers" 
                className="text-gray-700 hover:text-[#00B207] transition-colors font-medium"
              >
                Farmers
              </Link>

              {/* Pages Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowPagesDropdown(true)}
                onMouseLeave={() => setShowPagesDropdown(false)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-[#00B207] transition-colors font-medium">
                  <span>Pages</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showPagesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      About Us
                    </Link>
                    <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      Contact
                    </Link>
                    <Link href="/faq" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      FAQ
                    </Link>
                    <Link href="/blog" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] transition-colors">
                      Blog
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-[#00B207] focus:ring-[#00B207]"
                />
              </div>
            </div>

            {/* Icons Row */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-6 h-6 text-gray-700" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#00B207] text-white text-xs rounded-full">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Link>

              {/* Cart */}
              <button 
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#00B207] text-white text-xs rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </button>

              {/* User Menu */}
              {status === "loading" ? (
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-[#00B207] transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback className="bg-[#00B207] text-white">
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-3">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user.name && (
                          <p className="font-medium text-sm">{session.user.name}</p>
                        )}
                        {session.user.email && (
                          <p className="w-[180px] truncate text-xs text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink(session.user.role)} className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
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

          {/* Mobile Search Bar */}
          <div className="lg:hidden pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-[#00B207] focus:ring-[#00B207]"
              />
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors font-medium"
              >
                Home
              </Link>

              {/* Shop Section */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Shop</div>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  All Products
                </Link>
                <Link
                  href="/products?category=vegetables"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  Vegetables
                </Link>
                <Link
                  href="/products?category=fruits"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  Fruits
                </Link>
                <Link
                  href="/products?category=dairy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  Dairy
                </Link>
                <Link
                  href="/products?organic=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  Organic
                </Link>
              </div>

              <Link
                href="/farmers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors font-medium"
              >
                Farmers
              </Link>

              {/* Pages Section */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Pages</div>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                >
                  Blog
                </Link>
              </div>
            </nav>

            {session ? (
              <div className="border-t p-4 mt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="bg-[#00B207] text-white">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href={getDashboardLink(session.user.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-[#00B207] rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
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

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  )
}
