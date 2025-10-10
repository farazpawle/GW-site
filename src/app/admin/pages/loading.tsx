import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-8">
      <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-lg border border-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Loading pages...</p>
      </div>
    </div>
  );
}
