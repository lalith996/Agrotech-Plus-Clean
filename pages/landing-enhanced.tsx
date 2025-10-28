/**
 * Enhanced Landing Page with GSAP Parallax and Scroll Animations
 * Advanced UI/UX with smooth scrolling and interactive elements
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Leaf,
  Truck,
  ShieldCheck,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function EnhancedLandingPage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Hero section animations
    const ctx = gsap.context(() => {
      // Title animation
      gsap.from('.hero-title', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power4.out',
      })

      // Subtitle animation
      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
      })

      // CTA buttons animation
      gsap.from('.hero-cta', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.2,
        ease: 'back.out(1.7)',
      })

      // Hero image parallax
      gsap.to('.hero-image', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Features fade in on scroll
      gsap.from('.feature-card', {
        opacity: 0,
        y: 80,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })

      // Stats counter animation
      gsap.from('.stat-number', {
        textContent: 0,
        duration: 2,
        ease: 'power1.out',
        snap: { textContent: 1 },
        stagger: 0.1,
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 75%',
        },
      })

      // CTA section scale animation
      gsap.from(ctaRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
        },
      })

      // Parallax floating elements
      gsap.to('.floating-1', {
        y: -50,
        rotation: 10,
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: 'sine.inOut',
      })

      gsap.to('.floating-2', {
        y: -30,
        rotation: -8,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut',
        delay: 0.5,
      })
    })

    return () => ctx.revert()
  }, [])

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const x = (clientX / window.innerWidth - 0.5) * 20
      const y = (clientY / window.innerHeight - 0.5) * 20
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Farm Fresh',
      description: 'Direct from local farmers to your doorstep',
      color: 'from-green-400 to-emerald-600',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Same-day delivery for your convenience',
      color: 'from-blue-400 to-cyan-600',
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Quality Assured',
      description: 'Rigorous quality control on every product',
      color: 'from-purple-400 to-pink-600',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Certified Organic',
      description: 'Verified organic certifications',
      color: 'from-orange-400 to-red-600',
    },
  ]

  const stats = [
    { number: 5000, label: 'Happy Customers', suffix: '+' },
    { number: 50, label: 'Partner Farmers', suffix: '+' },
    { number: 10000, label: 'Products Delivered', suffix: '+' },
    { number: 98, label: 'Satisfaction Rate', suffix: '%' },
  ]

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-1 absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
        <div className="floating-2 absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  #1 Farm-to-Table Platform
                </span>
              </div>

              <h1 className="hero-title text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                Fresh From
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  Farm to Fork
                </span>
              </h1>

              <p className="hero-subtitle text-xl text-gray-600 leading-relaxed max-w-xl">
                Experience the joy of fresh, organic produce delivered straight
                from local farmers to your doorstep. Quality you can trust,
                freshness you can taste.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="hero-cta">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Shop Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline"
                  className="hero-cta px-8 py-6 text-lg rounded-full border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Video
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">100% Organic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Same-day Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Quality Assured</span>
                </div>
              </div>
            </div>

            {/* Right image */}
            <div className="relative">
              <div className="hero-image relative z-10">
                <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/hero-vegetables.jpg"
                    alt="Fresh organic vegetables"
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800'
                    }}
                  />
                </div>
              </div>

              {/* Floating cards */}
              <Card className="absolute -left-4 top-20 p-4 bg-white shadow-xl backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">Organic</p>
                  </div>
                </div>
              </Card>

              <Card className="absolute -right-4 bottom-32 p-4 bg-white shadow-xl backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">5000+</p>
                    <p className="text-sm text-gray-600">Customers</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose AgroTrack+
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference of farm-fresh quality with our unique
              advantages
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card group p-8 text-center hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-green-200 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-24 px-4 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-110 transition-transform duration-300"
              >
                <div className="stat-number text-5xl md:text-6xl font-bold text-white mb-2">
                  {stat.number}{stat.suffix}
                </div>
                <div className="text-green-100 text-lg font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Experience Freshness?
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers enjoying farm-fresh produce
                delivered to their doorstep
              </p>
              
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-xl rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Started Today
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
