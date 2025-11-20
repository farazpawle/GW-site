'use client';

import { useSearchParams, useRouter } from 'next/navigation';

interface SearchMetadata {
  currentPage: number;
  totalPages: number;
}

interface PaginationProps {
  metadata: SearchMetadata;
  query: string;
}

export default function Pagination({ metadata, query }: PaginationProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPage, totalPages } = metadata;
  
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('q', query);
    return `/search?${params.toString()}`;
  };
  
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center items-center gap-2">
      {/* Previous Button */}
      {currentPage > 1 && (
        <a
          href={buildPageUrl(currentPage - 1)}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#6e0000] transition-colors"
        >
          Previous
        </a>
      )}
      
      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <a href={buildPageUrl(1)} className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#6e0000] transition-colors">
            1
          </a>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}
      
      {pages.map((page) => (
        <a
          key={page}
          href={buildPageUrl(page)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            page === currentPage
              ? 'bg-[#6e0000] border-[#6e0000] text-white'
              : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#6e0000]'
          }`}
        >
          {page}
        </a>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
          <a href={buildPageUrl(totalPages)} className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#6e0000] transition-colors">
            {totalPages}
          </a>
        </>
      )}
      
      {/* Next Button */}
      {currentPage < totalPages && (
        <a
          href={buildPageUrl(currentPage + 1)}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#6e0000] transition-colors"
        >
          Next
        </a>
      )}
    </div>
  );
}
