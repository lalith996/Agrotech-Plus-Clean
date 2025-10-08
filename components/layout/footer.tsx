"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf, Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    
    setTimeout(() => {
      setMessage("Thank you for subscribing!")
      setEmail("")
      setIsSubmitting(false)
      setTimeout(() => setMessage(""), 3000)
    }, 1000)
  }

  return (
    <footer className="bg-gray-50 border-t">
      {/* Newsletter Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 mb-6">
              Get updates on fresh arrivals and exclusive offers
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-full border-gray-300 focus:border-[#00B207] focus:ring-[#00B207]"
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="submit" 
                className="rounded-full bg-[#00B207] hover:bg-green-700 px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${message.includes("Thank") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00B207] to-green-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AgroTrack+</span>
            </Link>
            <p className="text-gray-600 text-sm">
              Connecting you directly with local farmers for the freshest, most sustainable produce.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-[#00B207] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#mission" className="hover:text-[#00B207] transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/farmers" className="hover:text-[#00B207] transition-colors">
                  Meet Farmers
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#00B207] transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-[#00B207] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#00B207] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#00B207] transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#00B207] transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/auth/signin" className="hover:text-[#00B207] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#00B207] transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#00B207] transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#00B207] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/products?category=vegetables" className="hover:text-[#00B207] transition-colors">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link href="/products?category=fruits" className="hover:text-[#00B207] transition-colors">
                  Fruits
                </Link>
              </li>
              <li>
                <Link href="/products?category=dairy" className="hover:text-[#00B207] transition-colors">
                  Dairy
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#00B207] transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} AgroTrack+. All rights reserved. Made with 🌱 for sustainable farming.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-[#00B207] hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-[#00B207] hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-[#00B207] hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 mr-2">We accept:</span>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                  VISA
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                  MC
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                  AMEX
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
