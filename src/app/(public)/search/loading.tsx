export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-[#1a1a1a] rounded animate-pulse mb-2" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="h-6 w-32 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-10 w-48 bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        </div>
        
        {/* Results Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a]"
            >
              {/* Image Skeleton */}
              <div className="aspect-square bg-[#0f0f0f] animate-pulse" />
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-[#0f0f0f] rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#0f0f0f] rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-[#0f0f0f] rounded animate-pulse" />
                </div>
                <div className="h-3 w-24 bg-[#0f0f0f] rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 bg-[#0f0f0f] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-[#0f0f0f] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Skeleton */}
        <div className="flex justify-center items-center gap-2">
          <div className="h-10 w-24 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-10 w-10 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-10 w-10 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-10 w-10 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-10 w-24 bg-[#1a1a1a] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
