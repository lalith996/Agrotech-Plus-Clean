import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Search, MessageCircle, Mail } from "lucide-react"

const faqCategories = [
  {
    id: "orders",
    title: "Orders & Delivery",
    icon: "📦",
    faqs: [
      {
        question: "What are your delivery timings?",
        answer: "We deliver between 6 AM - 10 AM and 4 PM - 8 PM on all days. You can choose your preferred time slot during checkout. We ensure your produce reaches you fresh within 24 hours of harvest."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order is confirmed, you'll receive a tracking link via SMS and email. You can also track your order in real-time from your dashboard. Our live tracking shows when your order is picked from the farm, when it's out for delivery, and the estimated arrival time."
      },
      {
        question: "What is your delivery area?",
        answer: "We currently deliver to 25+ cities across India. During checkout, enter your pincode to check if we deliver to your area. We're constantly expanding our delivery network to reach more customers."
      },
      {
        question: "What if I'm not home during delivery?",
        answer: "Our delivery partner will call you before arrival. If you're not available, you can authorize a neighbor or security guard to receive the order, or reschedule delivery for the next available slot at no extra charge."
      },
      {
        question: "Is there a minimum order value?",
        answer: "Yes, the minimum order value is ₹299 for free delivery. Orders below this amount will incur a delivery charge of ₹40. We recommend planning your weekly groceries to get the most value."
      }
    ]
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    icon: "🔄",
    faqs: [
      {
        question: "How do subscriptions work?",
        answer: "Choose your products and delivery frequency (daily, weekly, bi-weekly, or monthly). Your order will be automatically delivered on your chosen schedule. You can pause, modify, or cancel anytime from your dashboard."
      },
      {
        question: "Can I modify my subscription?",
        answer: "Yes! You can add or remove products, change quantities, modify delivery frequency, or pause your subscription anytime. Changes must be made at least 24 hours before your next scheduled delivery."
      },
      {
        question: "What are the subscription benefits?",
        answer: "Subscription customers enjoy 10% off on all products, free delivery, priority customer support, and the flexibility to pause or skip deliveries when needed. Plus, you'll never run out of fresh produce!"
      },
      {
        question: "How do I cancel my subscription?",
        answer: "You can cancel your subscription anytime from your account dashboard with no cancellation fees. Your subscription will remain active until the end of your current billing cycle."
      }
    ]
  },
  {
    id: "payments",
    title: "Payments & Refunds",
    icon: "💳",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), net banking, and wallets. We also offer Cash on Delivery for orders above ₹500."
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely! We use 256-bit SSL encryption and PCI DSS compliant payment gateways. We never store your complete card details on our servers. All transactions are processed through secure, encrypted channels."
      },
      {
        question: "What is your refund policy?",
        answer: "If you're not satisfied with the quality of products, contact us within 24 hours of delivery with photos. We'll process a full refund or replacement immediately. Refunds are credited to your original payment method within 5-7 business days."
      },
      {
        question: "Do you offer discounts or promo codes?",
        answer: "Yes! We regularly offer seasonal discounts, first-time customer offers, and referral bonuses. Subscribe to our newsletter and follow us on social media to stay updated on the latest deals."
      },
      {
        question: "Can I get an invoice for my orders?",
        answer: "Yes, invoices are automatically sent to your email after each order. You can also download invoices from your order history in the dashboard. For GST-registered businesses, we provide tax invoices with complete details."
      }
    ]
  },
  {
    id: "products",
    title: "Products & Quality",
    icon: "🌱",
    faqs: [
      {
        question: "Are all products 100% organic?",
        answer: "Yes! All our products are certified organic and sourced directly from verified organic farmers. We conduct regular third-party testing and maintain complete farm-to-table traceability for every product."
      },
      {
        question: "How do you ensure freshness?",
        answer: "We harvest products early morning and deliver within 24 hours. Our cold chain logistics maintain optimal temperature throughout transit. Each product is hand-picked and quality-checked by our expert team before dispatch."
      },
      {
        question: "What if I receive damaged or spoiled products?",
        answer: "Quality is our top priority. If any product doesn't meet your expectations, contact us immediately with photos. We'll arrange a replacement or full refund within 24 hours, no questions asked."
      },
      {
        question: "Can I request specific products?",
        answer: "Absolutely! If you're looking for specific organic products not currently listed, let us know through our contact form. We work closely with farmers and can source seasonal and specialty items based on demand."
      },
      {
        question: "How should I store the products?",
        answer: "Each product comes with storage instructions on the package. Generally, leafy greens should be refrigerated immediately, root vegetables can be stored in a cool, dark place, and fruits are best consumed fresh. Our customer service team is always available for storage tips."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: "👤",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click on 'Sign Up' in the top right corner, enter your email, phone number, and create a password. You can also sign up using Google. Verify your email and phone to complete registration and start shopping!"
      },
      {
        question: "I forgot my password. What should I do?",
        answer: "Click on 'Forgot Password' on the login page, enter your registered email, and we'll send you a password reset link. Follow the link to create a new password. For security, the link expires in 1 hour."
      },
      {
        question: "Can I save multiple delivery addresses?",
        answer: "Yes! You can save unlimited delivery addresses in your profile. During checkout, simply select your preferred address or add a new one. This makes ordering to different locations (home, office, etc.) super convenient."
      },
      {
        question: "How do I update my profile information?",
        answer: "Go to your account dashboard and click on 'Profile Settings'. You can update your name, email, phone number, and addresses. For security, email changes require verification through a confirmation link."
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account from Profile Settings. Please note that this action is permanent and will delete all your order history, saved addresses, and subscription details. You'll receive a confirmation email before deletion."
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["orders"])

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
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
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Find answers to common questions about our products, delivery, and services
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-2xl border-gray-300 focus:border-[#00B207] focus:ring-[#00B207] shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredCategories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-600 text-lg">
                    No FAQs found matching "{searchQuery}". Please try different keywords or{" "}
                    <Link href="/contact" className="text-[#00B207] hover:underline font-semibold">
                      contact us
                    </Link>{" "}
                    for help.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {filteredCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      id={category.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                          <span className="text-3xl">{category.icon}</span>
                          <span>{category.title}</span>
                        </h2>
                      </div>

                      <div className="p-6">
                        <Accordion
                          type="multiple"
                          defaultValue={["0"]}
                          className="space-y-4"
                        >
                          {category.faqs.map((faq, faqIndex) => (
                            <AccordionItem
                              key={faqIndex}
                              value={faqIndex.toString()}
                              className="border border-gray-200 rounded-xl px-6 data-[state=open]:bg-green-50"
                            >
                              <AccordionTrigger className="text-left hover:no-underline py-4">
                                <span className="font-semibold text-gray-900 pr-4">
                                  {faq.question}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00B207] mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Still Have Questions?
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Can't find the answer you're looking for? Our friendly customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#00B207] text-white rounded-full font-semibold hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Support
                </Link>
                <a
                  href="tel:+918012345678"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#00B207] border-2 border-[#00B207] rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg"
                >
                  Call Us: +91 80 1234 5678
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
  )
}
