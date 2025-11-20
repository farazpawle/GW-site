'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortDropdownProps {
  currentSort: string;
  query: string;
}

export default function SortDropdown({ currentSort, query }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <select
      value={currentSort || 'relevance'}
      onChange={handleSortChange}
      className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#6e0000]"
    >
      <option value="relevance">Sort by: Relevance</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
      <option value="name-desc">Name: Z to A</option>
      <option value="newest">Newest First</option>
    </select>
  );
}
