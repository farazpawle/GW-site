import { Search, X } from 'lucide-react';
import { memo } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function SearchBar({
  value,
  onChange,
  placeholder = 'Search files...',
  disabled = false,
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] 
                 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#6e0000]
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {value && !disabled && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Memoize to prevent re-renders when props haven't changed
export default memo(SearchBar);
