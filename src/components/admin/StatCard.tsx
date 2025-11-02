import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}

export default function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 hover:border-brand-maroon/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-maroon/10 overflow-hidden">
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-maroon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2 group-hover:text-gray-300 transition-colors">{title}</p>
          <p className="text-4xl font-bold text-white mb-1">{value}</p>
          {description && (
            <p className="text-gray-500 text-xs mt-2 group-hover:text-gray-400 transition-colors">{description}</p>
          )}
        </div>
        <div className="bg-brand-maroon/10 group-hover:bg-brand-maroon/20 p-4 rounded-xl transition-all duration-300 shadow-lg flex-shrink-0">
          <Icon className="text-brand-maroon group-hover:text-brand-red" size={28} />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-maroon to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
