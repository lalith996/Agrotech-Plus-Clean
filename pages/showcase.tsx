/**
 * Animation Showcase Page
 * Demonstrates all GSAP animations and animated components
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  AnimatedButton,
  PulsingButton,
  GlowingButton,
  ShimmerButton,
} from '@/components/ui/animated-button'
import { Card } from '@/components/ui/card'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import {
  Sparkles,
  Zap,
  Rocket,
  Heart,
  Star,
  ArrowRight,
  Play,
  Download,
  ShoppingCart,
} from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function AnimationShowcase() {
  const router = useRouter()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.from('.showcase-hero', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      })

      // Section titles
      gsap.from('.section-title', {
        opacity: 0,
        x: -50,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.section-title',
          start: 'top 85%',
        },
      })

      // Card animations
      gsap.from('.demo-card', {
        opacity: 0,
        y: 80,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.demo-card',
          start: 'top 90%',
        },
      })

      // Counter animation
      const counters = document.querySelectorAll('.counter')
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0')
        gsap.to(counter, {
          textContent: target,
          duration: 2,
          snap: { textContent: 1 },
          ease: 'power1.out',
          scrollTrigger: {
            trigger: counter,
            start: 'top 80%',
          },
        })
      })

      // Parallax elements
      gsap.to('.parallax-element', {
        yPercent: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.parallax-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  const buttonVariants = [
    { name: 'Default', variant: 'default' as const },
    { name: 'Outline', variant: 'outline' as const },
    { name: 'Ghost', variant: 'ghost' as const },
    { name: 'Gradient', variant: 'gradient' as const },
  ]

  const buttonSizes = [
    { name: 'Small', size: 'sm' as const },
    { name: 'Medium', size: 'md' as const },
    { name: 'Large', size: 'lg' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="showcase-hero text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Advanced UI/UX Animations
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900">
              Animation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Showcase
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our collection of GSAP-powered animations, magnetic buttons,
              parallax effects, and interactive components
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <AnimatedButton
                variant="gradient"
                size="lg"
                onClick={() => router.push('/products')}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Now
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="lg"
                onClick={() => router.push('/')}
              >
                Back to Home
                <ArrowRight className="w-5 h-5 ml-2" />
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Button Variants Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
            Animated Buttons
          </h2>

          <div className="space-y-12">
            {/* Magnetic Buttons */}
            <Card className="demo-card p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Magnetic Effect Buttons
              </h3>
              <p className="text-gray-600 mb-6">
                Hover over buttons to see the magnetic attraction effect
              </p>
              <div className="flex flex-wrap gap-4">
                {buttonVariants.map(({ name, variant }) => (
                  <AnimatedButton key={name} variant={variant} magnetic>
                    <Zap className="w-4 h-4 mr-2" />
                    {name} Button
                  </AnimatedButton>
                ))}
              </div>
            </Card>

            {/* Ripple Buttons */}
            <Card className="demo-card p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ripple Effect Buttons
              </h3>
              <p className="text-gray-600 mb-6">
                Click buttons to see the ripple animation
              </p>
              <div className="flex flex-wrap gap-4">
                {buttonSizes.map(({ name, size }) => (
                  <AnimatedButton
                    key={name}
                    variant="gradient"
                    size={size}
                    ripple
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {name}
                  </AnimatedButton>
                ))}
              </div>
            </Card>

            {/* Special Effect Buttons */}
            <Card className="demo-card p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Special Effects
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced button effects with pulsing, glowing, and shimmer
              </p>
              <div className="flex flex-wrap gap-4">
                <PulsingButton size="lg">
                  <Heart className="w-5 h-5 mr-2" />
                  Pulsing Button
                </PulsingButton>

                <GlowingButton size="lg">
                  <Star className="w-5 h-5 mr-2" />
                  Glowing Button
                </GlowingButton>

                <ShimmerButton size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Shimmer Button
                </ShimmerButton>

                <AnimatedButton
                  variant="gradient"
                  size="lg"
                  className="animate-gradient"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Gradient Shift
                </AnimatedButton>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Scroll Animations Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
            Scroll-Triggered Animations
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card
                key={i}
                className="demo-card p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl mb-4 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Feature {i}
                </h3>
                <p className="text-gray-600">
                  This card fades in and slides up when you scroll to it
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Counter Animation Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Animated Counters
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { target: 10000, label: 'Products Sold', suffix: '+' },
              { target: 5000, label: 'Happy Customers', suffix: '+' },
              { target: 50, label: 'Partner Farmers', suffix: '+' },
              { target: 98, label: 'Satisfaction', suffix: '%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">
                  <span className="counter" data-target={stat.target}>
                    0
                  </span>
                  {stat.suffix}
                </div>
                <div className="text-green-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Section */}
      <section className="parallax-section py-32 px-4 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <div className="parallax-element absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Parallax Scrolling Effect
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            The background moves at a different speed creating depth
          </p>
          <AnimatedButton variant="gradient" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Get Started
          </AnimatedButton>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <Sparkles className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience These Animations?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start shopping with our beautifully animated interface
            </p>
            <Link href="/products">
              <GlowingButton size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowingButton>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}
