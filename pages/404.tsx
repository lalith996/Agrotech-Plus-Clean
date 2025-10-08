import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Search, Home, ShoppingBag, Leaf, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Custom404() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const categories = [
    { name: 'Vegetables', href: '/products?category=vegetables', icon: Leaf },
    { name: 'Fruits', href: '/products?category=fruits', icon: Sprout },
    { name: 'Dairy', href: '/products?category=dairy', icon: ShoppingBag },
  ]

  return (
    <>
      <Head>
        <title>404 - Page Not Found | AgroTrack+</title>
        <meta name="description" content="Oops! This organic page isn't ripe yet. The page you're looking for doesn't exist." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-background dark:via-background dark:to-brand-900/20 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Animated 404 with organic elements */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mb-8"
            >
              <h1 className="text-[120px] md:text-[200px] font-bold text-brand-500 leading-none relative">
                404
                <motion.div
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute -top-6 -right-4 md:-top-12 md:-right-8"
                >
                  <Leaf className="w-16 h-16 md:w-24 md:h-24 text-brand-600 dark:text-brand-400" />
                </motion.div>
                <motion.div
                  initial={{ rotate: 10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8"
                >
                  <Sprout className="w-12 h-12 md:w-20 md:h-20 text-brand-500" />
                </motion.div>
              </h1>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! This organic page isn't ripe yet
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                The page you're looking for has been harvested or doesn't exist. 
                Let's help you find what you need!
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for organic products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 pr-4 text-base rounded-xl border-2 border-brand-200 dark:border-brand-800 focus:border-brand-500 dark:focus:border-brand-500"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-8 h-12 gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Homepage
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl px-8 h-12 gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Browse Products
                </Button>
              </Link>
            </motion.div>

            {/* Popular Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Or explore our popular categories:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    >
                      <Link href={category.href}>
                        <Button
                          variant="secondary"
                          className="rounded-xl gap-2 h-11 bg-white dark:bg-card border border-brand-200 dark:border-brand-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                        >
                          <Icon className="w-4 h-4" />
                          {category.name}
                        </Button>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
