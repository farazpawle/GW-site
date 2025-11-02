'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// ============================================================
// Validation Schema
// ============================================================

const quoteRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(100, 'Email is too long'),
  phone: z.string().optional(),
  company: z.string().max(100, 'Company name is too long').optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message is too long'),
});

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

// ============================================================
// Component Props
// ============================================================

interface QuoteRequestFormProps {
  /**
   * Pre-fill form with product information
   */
  productContext?: {
    partId: string;
    partName: string;
    partNumber: string;
    price: number;
  };
  
  /**
   * Callback after successful submission
   */
  onSuccess?: () => void;
  
  /**
   * Custom class for styling
   */
  className?: string;
}

// ============================================================
// Quote Request Form Component
// ============================================================

export default function QuoteRequestForm({
  productContext,
  onSuccess,
  className = '',
}: QuoteRequestFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: productContext
        ? `I'm interested in ${productContext.partName} (Part #${productContext.partNumber}). Listed price: $${productContext.price.toFixed(2)}.\n\nPlease provide a quote for:\n`
        : '',
    },
  });

  // ============================================================
  // Form Submission Handler
  // ============================================================

  const onSubmit = async (data: QuoteRequestFormData) => {
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      const payload = {
        ...data,
        products: productContext
          ? [
              {
                partId: productContext.partId,
                partName: productContext.partName,
                partNumber: productContext.partNumber,
                price: productContext.price,
                quantity: 1, // Default quantity
              },
            ]
          : null,
      };

      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit quote request' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      setSubmitStatus('success');
      reset();
      
      if (onSuccess) {
        onSuccess();
      }

      // Auto-reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Quote request submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit quote request');
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 ${className}`}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        Request a Quote
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {productContext
          ? `Get a custom quote for ${productContext.partName}`
          : 'Tell us about your requirements and we\'ll get back to you with a detailed quote'}
      </p>

      {/* Product Context Display */}
      {productContext && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Product: {productContext.partName}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Part Number: {productContext.partNumber}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Listed Price: ${productContext.price.toFixed(2)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="John Doe"
            disabled={submitStatus === 'loading'}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.email
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="john@example.com"
            disabled={submitStatus === 'loading'}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.phone
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="+1 (555) 123-4567"
            disabled={submitStatus === 'loading'}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company Name
          </label>
          <input
            id="company"
            type="text"
            {...register('company')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.company
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Your Company Ltd."
            disabled={submitStatus === 'loading'}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.company.message}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={6}
            {...register('message')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y ${
              errors.message
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Please describe your requirements, quantity needed, timeline, and any specific questions..."
            disabled={submitStatus === 'loading'}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitStatus === 'loading' || submitStatus === 'success'}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
            submitStatus === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : submitStatus === 'loading'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {submitStatus === 'loading' && (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting...
            </>
          )}
          {submitStatus === 'success' && (
            <>
              <CheckCircle size={20} />
              Quote Request Sent!
            </>
          )}
          {submitStatus === 'idle' && (
            <>
              <Send size={20} />
              Submit Quote Request
            </>
          )}
          {submitStatus === 'error' && (
            <>
              <Send size={20} />
              Try Again
            </>
          )}
        </button>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <p className="text-green-800 dark:text-green-200 text-sm">
              Thank you! Your quote request has been received. We&apos;ll get back to you within 24 hours.
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMessage || 'Failed to submit quote request. Please try again.'}
            </p>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
