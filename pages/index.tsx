import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Leaf, 
  Users, 
  Truck, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Award,
  Heart,
  Mail,
  Apple,
  Carrot,
  Coffee
} from "lucide-react"
import { UserRole } from "@prisma/client"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (status === "authenticated" && session?.user) {
      switch (session.user.role) {
        case UserRole.CUSTOMER:
          router.push("/dashboard")
          break
        case UserRole.FARMER:
          router.push("/farmer/dashboard")
          break
        case UserRole.ADMIN:
        case UserRole.OPERATIONS:
          router.push("/admin/dashboard")
          break
        default:
          break
      }
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-earth-50 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 bg-brand/10 text-brand border-brand/20 px-4 py-2 text-sm font-medium rounded-full inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                100% Organic & Fresh
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Fresh Organic Food
                <br />
                <span className="text-brand">To Your Doorstep</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Connect directly with local farmers and get the freshest, most sustainable organic produce 
                delivered to your door. Farm-to-table transparency you can trust.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-brand hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg rounded-full">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 px-8 py-6 text-lg rounded-full">
                    Browse Products
                  </Button>
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand" />
                  <span>100% Organic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose AgroTrack+?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the way you get fresh produce by connecting you 
              directly with local farmers and ensuring complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-2 border-transparent hover:border-brand hover:shadow-xl transition-all duration-300 bg-white rounded-2xl group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand group-hover:scale-110 transition-all duration-300">
                  <Leaf className="h-8 w-8 text-brand group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-xl font-semibold">100% Organic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All our produce is certified organic, grown without harmful pesticides or chemicals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-brand hover:shadow-xl transition-all duration-300 bg-white rounded-2xl group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange group-hover:scale-110 transition-all duration-300">
                  <Users className="h-8 w-8 text-orange group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-xl font-semibold">Direct from Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Skip the middleman. Get produce directly from local farmers in your area.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-brand hover:shadow-xl transition-all duration-300 bg-white rounded-2xl group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand group-hover:scale-110 transition-all duration-300">
                  <Truck className="h-8 w-8 text-brand group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-xl font-semibold">Fresh Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cold-chain delivery ensures your produce arrives fresh and nutritious.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-brand hover:shadow-xl transition-all duration-300 bg-white rounded-2xl group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange group-hover:scale-110 transition-all duration-300">
                  <Shield className="h-8 w-8 text-orange group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-xl font-semibold">Quality Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Rigorous quality control and our collaborative rescue policy ensure satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide selection of fresh, organic produce
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/products?category=vegetables">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                  <Carrot className="h-16 w-16 text-brand group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-lg">Fresh Vegetables</h3>
                  <p className="text-sm text-gray-500 mt-1">Farm Fresh</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/products?category=fruits">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <Apple className="h-16 w-16 text-orange group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-lg">Fresh Fruits</h3>
                  <p className="text-sm text-gray-500 mt-1">Seasonal Picks</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/products?category=dairy">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-earth-50 to-earth-100 flex items-center justify-center">
                  <Coffee className="h-16 w-16 text-earth group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-lg">Organic Dairy</h3>
                  <p className="text-sm text-gray-500 mt-1">Pure & Natural</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/products?category=all">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center">
                  <Leaf className="h-16 w-16 text-brand group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-lg">All Products</h3>
                  <p className="text-sm text-gray-500 mt-1">Browse All</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-brand-50 to-earth-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting fresh, local produce has never been easier. Here's how AgroTrack+ works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Products</h3>
              <p className="text-gray-600">
                Browse our catalog and create a customized subscription based on your preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">We Prepare & Pack</h3>
              <p className="text-gray-600">
                Local farmers prepare the freshest produce with rigorous quality control.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Get fresh produce delivered to your door with complete traceability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers enjoying fresh, organic produce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-brand/20 bg-white rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-orange text-orange" />
                  ))}
                </div>
                <CardDescription className="text-gray-700">
                  "The freshest vegetables I've ever had! Knowing exactly where my food comes from gives me peace of mind. AgroTrack+ has changed how I shop for groceries."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Home Chef</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand/20 bg-white rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-orange text-orange" />
                  ))}
                </div>
                <CardDescription className="text-gray-700">
                  "Supporting local farmers while getting premium organic produce delivered to my door - it's a win-win! The quality is consistently outstanding."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Chen</p>
                    <p className="text-sm text-gray-500">Restaurant Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand/20 bg-white rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-orange text-orange" />
                  ))}
                </div>
                <CardDescription className="text-gray-700">
                  "The transparency is incredible. I can trace every item back to the farm. My family loves the fresh taste and I love the sustainable practices!"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                    <p className="text-sm text-gray-500">Health Enthusiast</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Statement */}
      <section className="py-20 bg-gradient-to-br from-brand-50 to-earth-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Complete Transparency
              </h2>
              <p className="text-lg text-gray-600">
                Know exactly where your money goes and what you're supporting
              </p>
            </div>
            
            <Card className="border-2 border-brand/20 bg-white rounded-3xl shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="font-semibold text-brand text-xl mb-6 flex items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      Where Your Money Goes
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-brand-50">
                        <span className="text-gray-700">Farm Gate (to farmer)</span>
                        <span className="font-bold text-brand text-lg">60%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <span className="text-gray-700">Logistics & Cold Chain</span>
                        <span className="font-semibold text-gray-900">15%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <span className="text-gray-700">Quality Assurance</span>
                        <span className="font-semibold text-gray-900">10%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <span className="text-gray-700">Platform Operations</span>
                        <span className="font-semibold text-gray-900">10%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <span className="text-gray-700">Packaging & Materials</span>
                        <span className="font-semibold text-gray-900">5%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand text-xl mb-6 flex items-center gap-2">
                      <Shield className="h-6 w-6" />
                      Our Commitments
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors duration-200">
                        <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Fair prices for farmers</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors duration-200">
                        <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Complete supply chain transparency</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors duration-200">
                        <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Sustainable farming practices</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors duration-200">
                        <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Quality guarantee on all products</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors duration-200">
                        <CheckCircle className="h-6 w-6 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">100% organic certification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-brand to-brand-700 border-none rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Subscribe to Our Newsletter
                  </h2>
                  <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                    Get weekly updates on fresh arrivals, exclusive deals, and farmer stories. 
                    Plus, enjoy 10% off your first order!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                    <Input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="flex-1 bg-white border-none h-12 px-6 text-gray-900 rounded-full"
                    />
                    <Button 
                      size="lg" 
                      className="bg-orange hover:bg-orange-600 text-white border-none shadow-lg px-8 rounded-full"
                    >
                      Subscribe
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-white/70 mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-50 via-white to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-brand/10 text-brand border-brand/20 px-4 py-2 text-sm font-medium rounded-full inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Join Our Community
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Start Your Farm-to-Table Journey?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Join thousands of customers who are already enjoying fresh, local produce 
            delivered directly from farmers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-brand hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-10 py-6 text-lg rounded-full">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 px-10 py-6 text-lg rounded-full">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}