import { Metadata } from 'next';
import Link from 'next/link';
import { Home, ChevronRight, Package, Wrench, Truck, Shield, HeadphonesIcon, Clock, CheckCircle } from 'lucide-react';

// ============================================================
// Metadata
// ============================================================

export const metadata: Metadata = {
  title: 'Our Services | GarritWulf',
  description: 'Comprehensive automotive parts and services including sourcing, technical support, logistics, and warranty solutions.',
  keywords: 'automotive services, parts sourcing, technical support, logistics, warranty, vehicle components',
};

// ============================================================
// Services Page
// ============================================================

export default function ServicesPage() {
  const services = [
    {
      icon: Package,
      title: 'Parts Sourcing & Supply',
      description: 'Access to a vast network of OEM and aftermarket automotive parts suppliers worldwide.',
      features: [
        'Original Equipment Manufacturer (OEM) parts',
        'High-quality aftermarket alternatives',
        'Genuine and certified components',
        'Competitive pricing on bulk orders',
      ],
      color: 'blue',
    },
    {
      icon: Wrench,
      title: 'Technical Consultation',
      description: 'Expert guidance on part selection, compatibility, and installation requirements.',
      features: [
        'Product compatibility verification',
        'Technical specifications support',
        'Installation guidance',
        'Application engineering',
      ],
      color: 'green',
    },
    {
      icon: Truck,
      title: 'Logistics & Delivery',
      description: 'Efficient supply chain management and reliable delivery to your location.',
      features: [
        'Global logistics network',
        'International delivery options',
        'Order tracking and updates',
        'Flexible delivery schedules',
      ],
      color: 'orange',
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Rigorous quality control processes to ensure you receive genuine, certified products.',
      features: [
        'Authenticity verification',
        'Quality inspection protocols',
        'Certification documentation',
        'Product testing and validation',
      ],
      color: 'purple',
    },
    {
      icon: HeadphonesIcon,
      title: 'Customer Support',
      description: 'Dedicated support team available to assist with inquiries and after-sales service.',
      features: [
        '24/7 customer service hotline',
        'Email and chat support',
        'Order status updates',
        'Returns and exchanges assistance',
      ],
      color: 'red',
    },
    {
      icon: Clock,
      title: 'Express Services',
      description: 'Urgent orders and expedited processing for time-critical requirements.',
      features: [
        'Same-day processing available',
        'Priority handling for urgent orders',
        'Expedited delivery options',
        'Emergency parts sourcing',
      ],
      color: 'indigo',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
  };

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
            <span className="text-gray-900 dark:text-white font-medium">Services</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Comprehensive Automotive Solutions
            </h1>
            <p className="text-xl text-gray-300">
              From parts sourcing to technical support, we provide end-to-end services for all your automotive needs
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const colors = colorClasses[service.color as keyof typeof colorClasses];
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className={`h-2 ${colors.bg}`} />
                <div className="p-6">
                  <div className={`w-14 h-14 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={28} className={colors.text} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className={`${colors.text} flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Why Choose GarritWulf?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Trusted Quality
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All products are sourced from verified suppliers and undergo rigorous quality checks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Fast Delivery
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Efficient logistics network ensures timely delivery of your orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <HeadphonesIcon size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Expert Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our experienced team provides professional guidance and technical assistance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Wide Selection
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Extensive catalog of automotive parts for various makes and models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Request a quote or browse our product catalog
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
              >
                Request Quote
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors border-2 border-white"
              >
                <Package size={20} />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
