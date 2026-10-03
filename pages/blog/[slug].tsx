import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock, Share2, Facebook, Twitter, ArrowLeft, ChevronRight, MessageCircle } from "lucide-react"

const blogPostsData: Record<string, any> = {
  "organic-farming-benefits": {
    title: "10 Amazing Benefits of Organic Farming",
    excerpt: "Discover how organic farming practices are revolutionizing agriculture and creating a sustainable future for our planet.",
    category: "Farming Tips",
    author: "Dr. Priya Sharma",
    date: "2025-10-05",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop",
    content: `
      <p>Organic farming has emerged as a powerful solution to many of the environmental and health challenges we face today. As consumers become more conscious about what they eat and how it's produced, organic farming continues to gain momentum worldwide.</p>

      <h2>What is Organic Farming?</h2>
      <p>Organic farming is an agricultural method that relies on natural processes, biodiversity, and cycles adapted to local conditions rather than synthetic inputs like chemical fertilizers and pesticides. It's a holistic approach that considers the entire ecosystem.</p>

      <h2>The Top 10 Benefits</h2>

      <h3>1. Better Soil Health</h3>
      <p>Organic farming practices like crop rotation, composting, and natural fertilizers enrich the soil with nutrients and beneficial microorganisms. This creates a living soil ecosystem that sustains plant health for generations.</p>

      <h3>2. Reduced Environmental Pollution</h3>
      <p>By eliminating synthetic pesticides and fertilizers, organic farming significantly reduces water and air pollution. This protects local ecosystems and contributes to cleaner rivers, lakes, and groundwater.</p>

      <h3>3. Enhanced Biodiversity</h3>
      <p>Organic farms support diverse plant and animal species, creating balanced ecosystems. This biodiversity helps control pests naturally and maintains ecological balance.</p>

      <h3>4. Climate Change Mitigation</h3>
      <p>Organic farming practices sequester more carbon in the soil, helping combat climate change. Healthy organic soils act as carbon sinks, removing CO2 from the atmosphere.</p>

      <h3>5. Healthier Food Products</h3>
      <p>Studies show organic produce often contains higher levels of antioxidants, vitamins, and minerals. Plus, they're free from harmful pesticide residues.</p>

      <h3>6. Support for Local Economies</h3>
      <p>Organic farming often involves smaller, local farms that contribute to community resilience and economic sustainability.</p>

      <h3>7. Water Conservation</h3>
      <p>Organic farming techniques like mulching and cover cropping help retain soil moisture, reducing water consumption significantly.</p>

      <h3>8. Animal Welfare</h3>
      <p>Organic livestock farming prioritizes animal welfare, providing animals with outdoor access, space to move, and natural feed.</p>

      <h3>9. Farmer Health and Safety</h3>
      <p>Farmers who practice organic methods aren't exposed to harmful chemicals, reducing health risks associated with pesticide use.</p>

      <h3>10. Long-term Sustainability</h3>
      <p>Organic farming builds resilient agricultural systems that can sustain productivity for future generations without depleting natural resources.</p>

      <h2>Making the Switch</h2>
      <p>Whether you're a farmer considering organic methods or a consumer choosing organic products, every step toward organic farming contributes to a healthier planet. At AgroTrack+, we're committed to supporting organic farmers and making fresh organic produce accessible to everyone.</p>

      <p>The future of farming is organic, and the time to embrace it is now. Together, we can create a sustainable food system that nourishes both people and the planet.</p>
    `
  },
  "seasonal-vegetables-guide": {
    title: "Seasonal Vegetables Guide for October",
    category: "Farming Tips",
    author: "Rajesh Kumar",
    date: "2025-10-03",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1200&h=600&fit=crop",
    content: "<p>October brings a wonderful variety of fresh vegetables perfect for autumn recipes...</p>"
  },
  "organic-detox-smoothie-recipes": {
    title: "5 Organic Detox Smoothie Recipes",
    category: "Recipes",
    author: "Chef Anjali Desai",
    date: "2025-10-01",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=1200&h=600&fit=crop",
    content: "<p>Start your day with these refreshing organic smoothies...</p>"
  }
}

const relatedPosts = [
  {
    slug: "seasonal-vegetables-guide",
    title: "Seasonal Vegetables Guide for October",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop",
    category: "Farming Tips"
  },
  {
    slug: "sustainable-farming-practices",
    title: "Sustainable Farming Practices That Make a Difference",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
    category: "Sustainability"
  },
  {
    slug: "health-benefits-organic-food",
    title: "The Science Behind Organic Food Health Benefits",
    image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop",
    category: "Health"
  }
]

export default function BlogArticlePage() {
  const router = useRouter()
  const { slug } = router.query
  
  const post = slug ? blogPostsData[slug as string] : null

  if (!post) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="bg-[#00B207] hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = post.title

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <>
      <div className="bg-white">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8">
          <Link href="/blog">
            <Button variant="ghost" className="hover:bg-green-50 hover:text-[#00B207]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Hero Image & Title */}
        <article className="pb-16">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {/* Category Badge */}
              <div className="mb-6">
                <Badge className="bg-[#00B207] text-white px-4 py-1">
                  {post.category}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1000px"
                  priority
                />
              </div>

              {/* Share Buttons */}
              <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-12">
                <div className="flex items-center space-x-3">
                  <Share2 className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Share this article:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="rounded-full hover:bg-sky-50 hover:text-sky-600 hover:border-sky-600"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('whatsapp')}
                    className="rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none mb-12 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author Bio */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 mb-12">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-full bg-[#00B207] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      About {post.author}
                    </h3>
                    <p className="text-gray-600">
                      {post.author} is a passionate advocate for sustainable agriculture and organic farming. 
                      With years of experience in the field, they share valuable insights to help farmers and 
                      consumers make informed decisions about organic produce.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Articles */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div
                      key={relatedPost.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-[#00B207] text-white">
                                {relatedPost.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#00B207] transition-colors">
                              {relatedPost.title}
                            </h3>
                            <div className="mt-4 flex items-center text-[#00B207] font-semibold">
                              Read More
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </>
  )
}
