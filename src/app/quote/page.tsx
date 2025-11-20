import { Metadata } from 'next';
import QuoteRequestForm from '@/components/public/QuoteRequestForm';
import Link from 'next/link';
import { Home, ChevronRight, Package, DollarSign, Clock, Shield } from 'lucide-react';

// ============================================================
// Metadata
// ============================================================

export const metadata: Metadata = {
  title: 'Request a Quote | GarritWulf',
  description: 'Get a custom quote for automotive parts and components. Fast response, competitive pricing, and expert service.',
  keywords: 'quote request, automotive parts quote, bulk orders, custom pricing, vehicle parts',
};

// ============================================================
// Quote Request Page
// ============================================================

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">Request Quote</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Request a Custom Quote
            </h1>
            <p className="text-xl text-blue-100">
              Get competitive pricing for automotive parts and bulk orders
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quote Form */}
            <div className="lg:col-span-2">
              <QuoteRequestForm />
            </div>

            {/* Sidebar - Why Choose Us */}
            <div className="space-y-6">
              {/* Benefits */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Request a Quote?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Competitive Pricing
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get the best prices for bulk orders and custom requirements
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Clock size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Fast Response
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We respond to all quote requests within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Expert Advice
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our team provides professional guidance on product selection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Custom Solutions
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tailored packages for your specific automotive needs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Other Ways to Reach Us
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                    <a href="tel:+971XXXXXXXXX" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                      +971 XX XXX XXXX
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <a href="mailto:sales@garritwulf.com" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                      sales@garritwulf.com
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Business Hours</p>
                    <p className="text-gray-900 dark:text-white">
                      Sunday - Thursday: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Browse Products */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-2">
                  Browse Our Catalog
                </h2>
                <p className="text-gray-300 text-sm mb-4">
                  Explore our full range of automotive parts and components
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                >
                  <Package size={16} />
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How long does it take to receive a quote?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We aim to respond to all quote requests within 24 hours during business days. For urgent requests, please call us directly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Can I request quotes for multiple products?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! Simply list all the products you&apos;re interested in the message field, including part numbers if available.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer discounts for bulk orders?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Absolutely! We provide competitive pricing for bulk orders. The more you order, the better the price per unit.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Is there a minimum order quantity?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No minimum order quantity for most products. However, some specialized items may have minimum requirements, which we&apos;ll communicate in our quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
