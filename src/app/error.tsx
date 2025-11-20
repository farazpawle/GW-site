'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Something went wrong!
        </h2>
        
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. An error occurred while processing your request.
        </p>
        
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-brand-red hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
