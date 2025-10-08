import { NextPageContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  statusCode?: number
  title?: string
}

function Error({ statusCode, title }: ErrorProps) {
  const router = useRouter()

  const getErrorMessage = () => {
    switch (statusCode) {
      case 400:
        return {
          title: 'Bad Request',
          description: 'The request could not be understood by the server.',
        }
      case 401:
        return {
          title: 'Unauthorized',
          description: 'You need to be logged in to access this page.',
        }
      case 403:
        return {
          title: 'Forbidden',
          description: "You don't have permission to access this resource.",
        }
      case 404:
        return {
          title: 'Page Not Found',
          description: 'The page you are looking for does not exist.',
        }
      case 500:
        return {
          title: 'Server Error',
          description: 'An internal server error occurred.',
        }
      case 502:
        return {
          title: 'Bad Gateway',
          description: 'The server received an invalid response.',
        }
      case 503:
        return {
          title: 'Service Unavailable',
          description: 'The server is temporarily unavailable.',
        }
      default:
        return {
          title: title || 'An Error Occurred',
          description: 'Something went wrong. Please try again later.',
        }
    }
  }

  const errorInfo = getErrorMessage()

  const getGradientColors = () => {
    if (!statusCode || statusCode >= 500) {
      return 'from-orange-50 via-white to-brand-50 dark:from-background dark:via-background dark:to-orange-900/20'
    }
    if (statusCode >= 400) {
      return 'from-red-50 via-white to-orange-50 dark:from-background dark:via-background dark:to-red-900/20'
    }
    return 'from-brand-50 via-white to-brand-100 dark:from-background dark:via-background dark:to-brand-900/20'
  }

  const getErrorColor = () => {
    if (!statusCode || statusCode >= 500) {
      return 'text-orange-500 dark:text-orange-400'
    }
    if (statusCode >= 400) {
      return 'text-red-500 dark:text-red-400'
    }
    return 'text-brand-500 dark:text-brand-400'
  }

  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} - ${errorInfo.title}` : errorInfo.title} | AgroTrack+</title>
        <meta name="description" content={errorInfo.description} />
      </Head>

      <div className={`min-h-screen bg-gradient-to-br ${getGradientColors()} flex items-center justify-center px-4 py-16`}>
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Animated Error Code */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mb-8"
            >
              {statusCode ? (
                <h1 className={`text-[100px] md:text-[160px] font-bold ${getErrorColor()} leading-none relative`}>
                  {statusCode}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 md:-top-12"
                  >
                    <AlertCircle className="w-16 h-16 md:w-24 md:h-24" />
                  </motion.div>
                </h1>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <AlertCircle className="w-32 h-32 md:w-48 md:h-48 mx-auto text-orange-500 dark:text-orange-400" />
                </motion.div>
              )}
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {errorInfo.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {errorInfo.description}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Button
                onClick={() => router.back()}
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-8 h-12 gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
              <Button
                onClick={() => router.reload()}
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-8 h-12 gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </Button>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl px-8 h-12 gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Button>
              </Link>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-600">
                If this problem persists, please{' '}
                <Link href="/contact" className="text-brand-500 hover:text-brand-600 underline">
                  contact our support team
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  const title = err ? err.message : undefined
  return { statusCode, title }
}

export default Error
