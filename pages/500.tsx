import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { RefreshCw, Home, AlertTriangle, Mail, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Custom500() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.reload()
  }

  return (
    <>
      <Head>
        <title>500 - Server Error | AgroTrack+</title>
        <meta name="description" content="Something went wrong on our farm. Our team is working to fix this issue." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-brand-50 dark:from-background dark:via-background dark:to-orange-900/20 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Animated 500 with warning icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mb-8"
            >
              <h1 className="text-[120px] md:text-[200px] font-bold text-orange-500 dark:text-orange-400 leading-none relative">
                500
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 md:-top-16"
                >
                  <AlertTriangle className="w-20 h-20 md:w-32 md:h-32 text-orange-500 dark:text-orange-400" />
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
                Something went wrong on our farm
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We're experiencing some technical difficulties. Our team has been notified 
                and is working hard to get things growing again. Please try again in a moment.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 h-12 gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Try Again'}
              </Button>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl px-8 h-12 gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Homepage
                </Button>
              </Link>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-2xl p-8 max-w-2xl mx-auto"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Need immediate assistance?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                If this problem persists, please don't hesitate to reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    className="rounded-xl gap-2 h-11 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 border border-brand-200 dark:border-brand-800"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Support
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="rounded-xl gap-2 h-11"
                  onClick={() => window.location.href = 'tel:+1234567890'}
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Us
                </Button>
              </div>
            </motion.div>

            {/* Error Code */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8"
            >
              <p className="text-sm text-gray-500 dark:text-gray-600">
                Error Code: 500 | Internal Server Error
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
