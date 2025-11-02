'use client';

import React, { useState } from 'react';
import { Mail, Phone, CheckCircle } from 'lucide-react';
import QuoteRequestForm from './QuoteRequestForm';

// ============================================================
// Component Props
// ============================================================

interface ProductInquiryProps {
  /**
   * Product information for context
   */
  product: {
    id: string;
    name: string;
    partNumber: string;
    price: number;
    slug?: string;
  };
  
  /**
   * Display mode
   */
  mode?: 'inline' | 'modal';
  
  /**
   * Custom class for styling
   */
  className?: string;
}

// ============================================================
// Product Inquiry Component
// ============================================================

export default function ProductInquiry({
  product,
  mode = 'inline',
  className = '',
}: ProductInquiryProps) {
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSuccess = () => {
    setSuccessMessage(true);
    setShowForm(false);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(false);
    }, 5000);
  };

  // ============================================================
  // Contact Methods Section
  // ============================================================

  const ContactMethods = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Request Quote Button */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <Mail size={20} />
          Request Quote
        </button>

        {/* Call Us Button */}
        <a
          href="tel:+1234567890"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <Phone size={20} />
          Call Us
        </a>
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Listed Price: <span className="font-semibold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
        </p>
        <p className="mt-1">
          Contact us for bulk orders, custom configurations, or special pricing
        </p>
      </div>
    </div>
  );

  // ============================================================
  // Render
  // ============================================================

  if (mode === 'inline') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-200 text-sm">
              Quote request sent! We&apos;ll contact you within 24 hours.
            </p>
          </div>
        )}

        {/* Show Form or Contact Methods */}
        {showForm ? (
          <div>
            <button
              onClick={() => setShowForm(false)}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              ← Back to contact options
            </button>
            <QuoteRequestForm
              productContext={{
                partId: product.id,
                partName: product.name,
                partNumber: product.partNumber,
                price: product.price,
              }}
              onSuccess={handleSuccess}
            />
          </div>
        ) : (
          <ContactMethods />
        )}
      </div>
    );
  }

  // Modal mode (future enhancement)
  return (
    <div className={className}>
      <ContactMethods />
      
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Request Quote for {product.name}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <QuoteRequestForm
                productContext={{
                  partId: product.id,
                  partName: product.name,
                  partNumber: product.partNumber,
                  price: product.price,
                }}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/90 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 flex items-center gap-2 z-50">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200 text-sm">
            Quote request sent successfully!
          </p>
        </div>
      )}
    </div>
  );
}
