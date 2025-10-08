import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, ChevronRight, ChevronLeft } from "lucide-react"

const blogPosts = [
  {
    slug: "organic-farming-benefits",
    title: "10 Amazing Benefits of Organic Farming",
    excerpt: "Discover how organic farming practices are revolutionizing agriculture and creating a sustainable future for our planet.",
    category: "Farming Tips",
    author: "Dr. Priya Sharma",
    date: "2025-10-05",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=500&fit=crop",
    featured: true
  },
  {
    slug: "seasonal-vegetables-guide",
    title: "Seasonal Vegetables Guide for October",
    excerpt: "Learn which vegetables are in season this month and how to make the most of fresh, local produce.",
    category: "Farming Tips",
    author: "Rajesh Kumar",
    date: "2025-10-03",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "organic-detox-smoothie-recipes",
    title: "5 Organic Detox Smoothie Recipes",
    excerpt: "Refresh and rejuvenate your body with these delicious organic smoothie recipes packed with nutrients.",
    category: "Recipes",
    author: "Chef Anjali Desai",
    date: "2025-10-01",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "health-benefits-organic-food",
    title: "The Science Behind Organic Food Health Benefits",
    excerpt: "Research-backed insights into why organic food is better for your health and well-being.",
    category: "Health",
    author: "Dr. Vikram Patel",
    date: "2025-09-28",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "sustainable-farming-practices",
    title: "Sustainable Farming Practices That Make a Difference",
    excerpt: "Explore innovative farming techniques that reduce environmental impact while increasing yield.",
    category: "Sustainability",
    author: "Environmental Expert Meera Singh",
    date: "2025-09-25",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "farm-to-table-recipes",
    title: "Farm-to-Table: Simple Recipes with Fresh Produce",
    excerpt: "Celebrate the flavors of fresh, organic ingredients with these easy-to-make recipes.",
    category: "Recipes",
    author: "Chef Anjali Desai",
    date: "2025-09-22",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "immunity-boosting-vegetables",
    title: "Top 10 Immunity-Boosting Vegetables",
    excerpt: "Strengthen your immune system naturally with these nutrient-rich organic vegetables.",
    category: "Health",
    author: "Nutritionist Kavita Reddy",
    date: "2025-09-20",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "composting-guide-beginners",
    title: "Composting 101: A Beginner's Guide",
    excerpt: "Start your composting journey with this comprehensive guide to turning waste into nutrient-rich soil.",
    category: "Sustainability",
    author: "Eco Warrior Arjun Nair",
    date: "2025-09-18",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1584736286279-4ca2dd4e8c7e?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "organic-vs-conventional-farming",
    title: "Organic vs Conventional Farming: What You Need to Know",
    excerpt: "Understanding the key differences between organic and conventional farming methods.",
    category: "Farming Tips",
    author: "Agricultural Expert Suresh Babu",
    date: "2025-09-15",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=500&fit=crop",
    featured: false
  },
  {
    slug: "healthy-salad-bowl-recipes",
    title: "7 Colorful Salad Bowl Recipes for Every Day",
    excerpt: "Add variety to your meals with these vibrant, nutritious salad bowl combinations.",
    category: "Recipes",
    author: "Chef Anjali Desai",
    date: "2025-09-12",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop",
    featured: false
  }
]

const categories = ["All", "Farming Tips", "Recipes", "Health", "Sustainability"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory)

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)

  const totalPages = Math.ceil(remainingPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = remainingPosts.slice(startIndex, endIndex)

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 to-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Our Blog
              </h1>
              <p className="text-xl text-gray-600">
                Insights, tips, and stories about organic farming, healthy living, and sustainable agriculture
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 border-b bg-white sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setCurrentPage(1)
                  }}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`rounded-full ${
                    selectedCategory === category
                      ? "bg-[#00B207] hover:bg-green-700 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-green-50 hover:text-[#00B207] hover:border-[#00B207]"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
              >
                <div className="mb-6">
                  <Badge className="bg-[#00B207] text-white px-4 py-1">Featured Article</Badge>
                </div>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <div className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-green-50 to-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow group">
                    <div className="relative h-80 md:h-auto overflow-hidden">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-[#00B207] text-white">
                          {featuredPost.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#00B207] transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center text-[#00B207] font-semibold group-hover:underline">
                          Read Article
                          <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {currentPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No articles found in this category.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentPosts.map((post, index) => (
                    <motion.div
                      key={post.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 group">
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-[#00B207] text-white">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#00B207] transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span className="line-clamp-1">{post.author}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center space-x-2 mt-12"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-full w-10 h-10 ${
                          currentPage === page
                            ? "bg-[#00B207] hover:bg-green-700"
                            : "hover:bg-green-50 hover:text-[#00B207]"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Get the latest articles, recipes, and farming tips delivered to your inbox every week.
              </p>
              <a
                href="/#newsletter"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#00B207] text-white rounded-full font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                Subscribe Now
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
