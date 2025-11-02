'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SearchErrorStateProps {
  onRetry?: () => void;
}

export default function SearchErrorState({ onRetry }: SearchErrorStateProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        {/* Error Icon */}
        <div className="mb-6">
          <AlertTriangle className="w-24 h-24 mx-auto text-red-500" />
        </div>
        
        {/* Error Message */}
        <h2 className="text-2xl font-bold mb-4 text-white">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-400 mb-8">
          We couldn&apos;t load the search results. This might be a temporary issue.
        </p>
        
        {/* Suggestions */}
        <div className="mb-8 text-left bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">What you can do:</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-[#6e0000] mt-1">•</span>
              <span>Try refreshing the page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6e0000] mt-1">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6e0000] mt-1">•</span>
              <span>Try again in a few moments</span>
            </li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry ? (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          )}
          
          <Link
            href="/products"
            className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:border-[#6e0000] transition-colors font-medium"
          >
            Browse All Products
          </Link>
        </div>
        
        {/* Help Link */}
        <p className="mt-6 text-sm text-gray-500">
          Still having issues?{' '}
          <Link href="/contact" className="text-[#6e0000] hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
