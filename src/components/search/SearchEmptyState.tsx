import Link from 'next/link';
import { Search } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
}

export default function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">No results found for &quot;{query}&quot;</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        We couldn&apos;t find what you&apos;re looking for. Try adjusting your search or filters to find what you need.
      </p>
      
      {/* Helpful Suggestions */}
      <div className="mb-8 max-w-md mx-auto">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Try these suggestions:</h3>
        <ul className="text-left space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-[#6e0000] mt-1">•</span>
            <span>Check your spelling and try again</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6e0000] mt-1">•</span>
            <span>Remove some filters to broaden your search</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6e0000] mt-1">•</span>
            <span>Try more general keywords</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6e0000] mt-1">•</span>
            <span>Browse our categories for similar products</span>
          </li>
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors font-medium inline-flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Browse All Products
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:border-[#6e0000] transition-colors font-medium"
        >
          Contact Us for Help
        </Link>
      </div>
    </div>
  );
}
