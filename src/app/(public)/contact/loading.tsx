export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          
          {/* Form Skeleton */}
          <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
