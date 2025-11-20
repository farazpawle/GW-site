export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* GW Logo Loader */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div 
            className="absolute inset-0 rounded-full border-4 border-gray-200"
          ></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-t-[#932020] border-r-transparent border-b-transparent border-l-transparent animate-spin"
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#932020] font-bold text-2xl">GW</span>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-xl font-semibold text-gray-800">
            Loading...
          </p>
          <p className="text-sm text-gray-500">
            Garrit & Wulf Premium Auto Parts
          </p>
        </div>
        
        {/* Loading Dots Animation */}
        <div className="flex justify-center items-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-[#932020] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#932020] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#932020] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
