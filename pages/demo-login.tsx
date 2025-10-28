/**
 * Demo Login Credentials Page
 * Quick access to test accounts for all user roles
 */

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Tractor, 
  Shield, 
  Truck, 
  Package,
  Copy,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface DemoAccount {
  role: string
  email: string
  password: string
  icon: React.ReactNode
  color: string
  description: string
}

export default function DemoLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const demoAccounts: DemoAccount[] = [
    {
      role: 'Customer',
      email: 'customer@demo.com',
      password: 'demo123456',
      icon: <User className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-600',
      description: 'Browse products, add to cart, place orders'
    },
    {
      role: 'Farmer',
      email: 'farmer@demo.com',
      password: 'demo123456',
      icon: <Tractor className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      description: 'Manage inventory, track orders, view analytics'
    },
    {
      role: 'Admin',
      email: 'admin@demo.com',
      password: 'demo123456',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      description: 'Full system access, user management, settings'
    },
    {
      role: 'Driver',
      email: 'driver@demo.com',
      password: 'demo123456',
      icon: <Truck className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      description: 'View delivery routes, update order status'
    },
    {
      role: 'Operations',
      email: 'operations@demo.com',
      password: 'demo123456',
      icon: <Package className="w-8 h-8" />,
      color: 'from-indigo-500 to-blue-600',
      description: 'Quality control, inventory management, logistics'
    }
  ]

  const handleLogin = async (email: string, password: string, role: string) => {
    setLoading(role)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        alert('Login failed: ' + result.error)
      } else {
        // Redirect based on role
        switch (role.toUpperCase()) {
          case 'CUSTOMER':
            router.push('/dashboard')
            break
          case 'FARMER':
            router.push('/farmer/dashboard')
            break
          case 'ADMIN':
          case 'OPERATIONS':
            router.push('/admin/dashboard')
            break
          case 'DRIVER':
            router.push('/driver/dashboard')
            break
          default:
            router.push('/')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('An error occurred during login')
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Demo Mode - No Registration Required
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Demo Login Credentials
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose any role below to instantly access the platform. No signup needed!
          </p>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {demoAccounts.map((account) => (
            <Card
              key={account.role}
              className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${account.color} rounded-2xl flex items-center justify-center text-white mb-4`}
              >
                {account.icon}
              </div>

              {/* Role */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {account.role}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">
                {account.description}
              </p>

              {/* Credentials */}
              <div className="space-y-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">Email</span>
                    <button
                      onClick={() => copyToClipboard(account.email, `${account.role}-email`)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copied === `${account.role}-email` ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <code className="text-sm text-gray-800 font-mono">
                    {account.email}
                  </code>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">Password</span>
                    <button
                      onClick={() => copyToClipboard(account.password, `${account.role}-password`)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copied === `${account.role}-password` ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <code className="text-sm text-gray-800 font-mono">
                    {account.password}
                  </code>
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={() => handleLogin(account.email, account.password, account.role)}
                disabled={loading !== null}
                className={`w-full bg-gradient-to-r ${account.color} text-white hover:opacity-90 transition-opacity`}
              >
                {loading === account.role ? (
                  'Logging in...'
                ) : (
                  <>
                    Login as {account.role}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Quick Access Guide</h3>
              <ul className="space-y-2 text-green-50">
                <li>• <strong>Customer:</strong> Browse products, manage cart, place orders</li>
                <li>• <strong>Farmer:</strong> Add products, manage inventory, view sales</li>
                <li>• <strong>Admin:</strong> Full system control, user management</li>
                <li>• <strong>Driver:</strong> View delivery routes, update statuses</li>
                <li>• <strong>Operations:</strong> Quality control, logistics management</li>
              </ul>
              <p className="mt-4 text-sm text-green-100">
                💡 Tip: Click the copy icon to copy credentials, or use the "Login" button for instant access
              </p>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
          
          <Link href="/auth/signin">
            <Button variant="outline" size="lg">
              Regular Sign In
            </Button>
          </Link>

          <Link href="/showcase">
            <Button variant="default" size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600">
              View Animations
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
